#!/usr/bin/env python3
"""Package main-branch frontend deltas or apply them safely on production."""

from __future__ import annotations

import argparse
import io
import json
import os
from pathlib import Path, PurePosixPath
import re
import subprocess
import sys
import tarfile
import tempfile


FRONTEND_PREFIX = "amazonia-viva-frontend/"
SERVER_STACK = Path("/home/adminkaaiya/projects/porerekua")
SERVER_WEB = SERVER_STACK / "porerekua-web"
DEPLOY_MARKER = Path("/home/adminkaaiya/.porerekua-main-deployed-sha")
IMAGE_NAME = "porerekua-web:latest"
ROLLBACK_IMAGE = "porerekua-web:ci-rollback"
SHA_RE = re.compile(r"^[0-9a-f]{40}$")
PROTECTED_NAMES = {"Dockerfile", ".dockerignore", "nginx.conf"}


def run(args: list[str], *, cwd: Path | None = None, input: bytes | None = None) -> bytes:
    result = subprocess.run(args, cwd=cwd, input=input, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    if result.returncode:
        if result.stdout:
            sys.stderr.buffer.write(result.stdout)
        if result.stderr:
            sys.stderr.buffer.write(result.stderr)
        raise RuntimeError(f"command failed ({result.returncode}): {' '.join(args)}")
    return result.stdout


def git_file(revision: str, path: str, cwd: Path) -> bytes | None:
    result = subprocess.run(
        ["git", "show", f"{revision}:{FRONTEND_PREFIX}{path}"],
        cwd=cwd,
        stdout=subprocess.PIPE,
        stderr=subprocess.DEVNULL,
    )
    return result.stdout if result.returncode == 0 else None


def safe_relative_path(value: str) -> str:
    path = PurePosixPath(value)
    if path.is_absolute() or not value or any(part in {"", ".", ".."} for part in path.parts):
        raise ValueError(f"unsafe deployment path: {value!r}")
    if any(part == ".git" for part in path.parts) or path.name in PROTECTED_NAMES or path.name.startswith(".env"):
        raise ValueError(f"server-managed path cannot be deployed automatically: {value}")
    return path.as_posix()


def package_patch(args: argparse.Namespace) -> None:
    if not SHA_RE.fullmatch(args.base) or not SHA_RE.fullmatch(args.head):
        raise ValueError("base/head must be full Git commit SHAs")
    repo = Path(args.repo_root).resolve()
    changed = run(
        ["git", "diff", "--name-only", "--no-renames", "--diff-filter=ACMTD", "-z", args.base, args.head, "--", "amazonia-viva-frontend"],
        cwd=repo,
    ).split(b"\0")
    paths: list[str] = []
    for raw_path in changed:
        if not raw_path:
            continue
        source_path = raw_path.decode("utf-8")
        if not source_path.startswith(FRONTEND_PREFIX):
            continue
        relative = safe_relative_path(source_path[len(FRONTEND_PREFIX):])
        paths.append(relative)

    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="porerekua-patch-") as temporary:
        root = Path(temporary)
        entries = []
        for relative in sorted(set(paths)):
            before = git_file(args.base, relative, repo)
            after = git_file(args.head, relative, repo)
            entry = {"path": relative, "base_exists": before is not None, "head_exists": after is not None}
            entries.append(entry)
            if before is not None:
                target = root / "base" / relative
                target.parent.mkdir(parents=True, exist_ok=True)
                target.write_bytes(before)
            if after is not None:
                target = root / "head" / relative
                target.parent.mkdir(parents=True, exist_ok=True)
                target.write_bytes(after)
        (root / "manifest.json").write_text(
            json.dumps({"base": args.base, "head": args.head, "files": entries}, ensure_ascii=False),
            encoding="utf-8",
        )
        with tarfile.open(output, "w:gz") as archive:
            for file_path in sorted(root.rglob("*")):
                if file_path.is_file():
                    archive.add(file_path, arcname=file_path.relative_to(root).as_posix(), recursive=False)
    print(f"Packaged {len(paths)} frontend paths from {args.base[:12]} to {args.head[:12]}")


def safe_extract(stream: bytes, destination: Path) -> None:
    with tarfile.open(fileobj=io.BytesIO(stream), mode="r:gz") as archive:
        members = archive.getmembers()
        if len(members) > 5000 or sum(item.size for item in members) > 100 * 1024 * 1024:
            raise ValueError("deployment archive exceeds limits")
        for item in members:
            name = PurePosixPath(item.name)
            if name.is_absolute() or any(part in {"", ".", ".."} for part in name.parts) or not item.isfile():
                raise ValueError(f"unsafe archive entry: {item.name!r}")
        for item in members:
            source = archive.extractfile(item)
            if source is None:
                raise ValueError(f"missing archive data: {item.name}")
            target = destination.joinpath(*PurePosixPath(item.name).parts)
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(source.read())


def current_status() -> None:
    if not DEPLOY_MARKER.is_file():
        raise RuntimeError("deployment marker is missing")
    sha = DEPLOY_MARKER.read_text(encoding="ascii").strip()
    if not SHA_RE.fullmatch(sha):
        raise RuntimeError("deployment marker is invalid")
    print(sha)


def apply_patch() -> None:
    if not DEPLOY_MARKER.is_file():
        raise RuntimeError("deployment marker is missing")
    with tempfile.TemporaryDirectory(prefix="porerekua-deploy-") as temporary:
        temp = Path(temporary)
        archive_bytes = sys.stdin.buffer.read(100 * 1024 * 1024 + 1)
        if len(archive_bytes) > 100 * 1024 * 1024:
            raise ValueError("deployment archive exceeds the upload limit")
        safe_extract(archive_bytes, temp)
        manifest_path = temp / "manifest.json"
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        base_sha, head_sha = manifest.get("base"), manifest.get("head")
        if not SHA_RE.fullmatch(base_sha or "") or not SHA_RE.fullmatch(head_sha or ""):
            raise ValueError("invalid commit SHA in deployment manifest")
        current_sha = DEPLOY_MARKER.read_text(encoding="ascii").strip()
        if current_sha != base_sha:
            raise RuntimeError(f"deployment base mismatch: server={current_sha}, package={base_sha}")
        if SERVER_WEB.resolve() != SERVER_WEB:
            raise RuntimeError("unexpected web checkout path")
        status = run(["git", "status", "--porcelain", "--untracked-files=normal"], cwd=SERVER_WEB).decode().strip()
        if status:
            raise RuntimeError(f"server web checkout is not clean:\n{status}")

        planned: list[tuple[str, bytes | None]] = []
        for entry in manifest.get("files", []):
            relative = safe_relative_path(entry["path"])
            base_path = temp / "base" / relative
            head_path = temp / "head" / relative
            base = base_path.read_bytes() if entry["base_exists"] else None
            head = head_path.read_bytes() if entry["head_exists"] else None
            destination = SERVER_WEB.joinpath(*PurePosixPath(relative).parts)
            resolved_parent = destination.parent.resolve()
            if SERVER_WEB not in resolved_parent.parents and resolved_parent != SERVER_WEB:
                raise ValueError(f"deployment path escapes checkout: {relative}")
            current = destination.read_bytes() if destination.is_file() else None

            if base is None:
                if current is not None and current != head:
                    raise RuntimeError(f"new file already exists with different content: {relative}")
                planned.append((relative, head))
            elif head is None:
                if current not in {None, base}:
                    raise RuntimeError(f"refusing to delete server-modified file: {relative}")
                planned.append((relative, None))
            elif current == base or current == head:
                planned.append((relative, head))
            elif current is None:
                raise RuntimeError(f"refusing to replace server-deleted file: {relative}")
            else:
                if b"\0" in base or b"\0" in current or b"\0" in head:
                    raise RuntimeError(f"binary file changed differently on server and main: {relative}")
                base_file, current_file, head_file = (temp / f"merge-{len(planned)}-{name}" for name in ("base", "current", "head"))
                base_file.write_bytes(base)
                current_file.write_bytes(current)
                head_file.write_bytes(head)
                result = subprocess.run(
                    ["git", "merge-file", "-p", str(current_file), str(base_file), str(head_file)],
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                )
                if result.returncode != 0:
                    raise RuntimeError(f"three-way merge conflict for {relative}: {result.stderr.decode(errors='replace')}")
                planned.append((relative, result.stdout))

        if not planned:
            temporary_marker = DEPLOY_MARKER.with_suffix(".tmp")
            temporary_marker.write_text(head_sha + "\n", encoding="ascii")
            os.replace(temporary_marker, DEPLOY_MARKER)
            print(f"No frontend files changed; advanced marker to {head_sha}")
            return

        original: dict[str, tuple[bool, bytes | None]] = {}
        changed_paths: list[str] = []
        for relative, content in planned:
            destination = SERVER_WEB.joinpath(*PurePosixPath(relative).parts)
            original[relative] = (destination.exists(), destination.read_bytes() if destination.is_file() else None)
            if content is None:
                destination.unlink(missing_ok=True)
            else:
                destination.parent.mkdir(parents=True, exist_ok=True)
                destination.write_bytes(content)
            changed_paths.append(relative)

        diff_check = subprocess.run(["git", "diff", "--check"], cwd=SERVER_WEB, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        if diff_check.returncode:
            for relative, (existed, content) in original.items():
                destination = SERVER_WEB.joinpath(*PurePosixPath(relative).parts)
                if existed and content is not None:
                    destination.parent.mkdir(parents=True, exist_ok=True)
                    destination.write_bytes(content)
                elif not existed:
                    destination.unlink(missing_ok=True)
            raise RuntimeError(f"patch whitespace check failed: {diff_check.stdout.decode(errors='replace')}{diff_check.stderr.decode(errors='replace')}")

        worktree_status = run(["git", "status", "--porcelain", "--untracked-files=normal"], cwd=SERVER_WEB).decode().strip()
        if not worktree_status:
            temporary_marker = DEPLOY_MARKER.with_suffix(".tmp")
            temporary_marker.write_text(head_sha + "\n", encoding="ascii")
            os.replace(temporary_marker, DEPLOY_MARKER)
            print(f"Frontend files already match; advanced marker to {head_sha}")
            return

        previous_image = run(["docker", "image", "inspect", IMAGE_NAME, "--format", "{{.Id}}"], cwd=SERVER_STACK).decode().strip()
        run(["docker", "image", "tag", previous_image, ROLLBACK_IMAGE], cwd=SERVER_STACK)
        try:
            run(["docker", "compose", "build", "porerekua-web"], cwd=SERVER_STACK)
            active_container = run(["docker", "compose", "ps", "-q", "porerekua-web"], cwd=SERVER_STACK).decode().strip()
            if not active_container:
                raise RuntimeError("cannot identify current web network for config validation")
            network_names = run(
                [
                    "docker",
                    "inspect",
                    "--format",
                    "{{range $name, $conf := .NetworkSettings.Networks}}{{$name}} {{end}}",
                    active_container,
                ],
                cwd=SERVER_STACK,
            ).decode().split()
            if not network_names:
                raise RuntimeError("current web container has no Docker network")
            run(
                ["docker", "run", "--rm", "--network", network_names[0], "--entrypoint", "nginx", IMAGE_NAME, "-t"],
                cwd=SERVER_STACK,
            )
            run(["docker", "compose", "up", "-d", "--no-deps", "porerekua-web"], cwd=SERVER_STACK)
            container = run(["docker", "compose", "ps", "-q", "porerekua-web"], cwd=SERVER_STACK).decode().strip()
            if not container:
                raise RuntimeError("web container was not created")
            for url in ("/", "/favicon.svg", "/favicon-dark.svg", "/sw.js"):
                run(["docker", "exec", container, "wget", "-q", "-O", "/dev/null", f"http://127.0.0.1{url}"], cwd=SERVER_STACK)
            run(["git", "add", "-A", "--", *changed_paths], cwd=SERVER_WEB)
            run(
                [
                    "git",
                    "-c", "user.name=github-actions[bot]",
                    "-c", "user.email=41898282+github-actions[bot]@users.noreply.github.com",
                    "commit", "-m", f"deploy: OctaLuna/Porerekua@{head_sha[:12]}",
                ],
                cwd=SERVER_WEB,
            )
            temporary_marker = DEPLOY_MARKER.with_suffix(".tmp")
            temporary_marker.write_text(head_sha + "\n", encoding="ascii")
            os.replace(temporary_marker, DEPLOY_MARKER)
        except Exception:
            try:
                run(["docker", "tag", ROLLBACK_IMAGE, IMAGE_NAME], cwd=SERVER_STACK)
                run(["docker", "compose", "up", "-d", "--no-deps", "porerekua-web"], cwd=SERVER_STACK)
            except Exception as rollback_error:
                print(f"container rollback failed: {rollback_error}", file=sys.stderr)
            for relative, (existed, content) in original.items():
                destination = SERVER_WEB.joinpath(*PurePosixPath(relative).parts)
                if existed and content is not None:
                    destination.parent.mkdir(parents=True, exist_ok=True)
                    destination.write_bytes(content)
                elif not existed:
                    destination.unlink(missing_ok=True)
            raise

        print(f"Deployed frontend main {head_sha}; changed {len(changed_paths)} paths")


def main() -> None:
    if len(sys.argv) > 1 and sys.argv[1] == "package":
        parser = argparse.ArgumentParser()
        parser.add_argument("package", choices=["package"])
        parser.add_argument("--base", required=True)
        parser.add_argument("--head", required=True)
        parser.add_argument("--repo-root", default=".")
        parser.add_argument("--output", required=True)
        package_patch(parser.parse_args())
        return

    command = os.environ.get("SSH_ORIGINAL_COMMAND", "")
    if command == "status":
        current_status()
    elif command == "apply":
        apply_patch()
    else:
        raise RuntimeError("unsupported command")


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        print(f"deployment failed: {error}", file=sys.stderr)
        sys.exit(1)
