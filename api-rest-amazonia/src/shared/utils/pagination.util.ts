import { PaginationResponseDto } from 'src/shared/dto/pagination-response.dto';

export function buildPagination<T>(
    data: T[],
    total: number,
    page: number,
    limit: number,
): PaginationResponseDto<T> {
    const pages = Math.ceil(total / limit);
    return {
        data,
        page,
        limit,
        pages,
        total,
        has_next: page < pages,
        has_prev: page > 1,
    };
}
