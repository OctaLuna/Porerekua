# ZAP Scanning Report

ZAP by [Checkmarx](https://checkmarx.com/).


## Summary of Alerts

| Risk Level | Number of Alerts |
| --- | --- |
| High | 0 |
| Medium | 0 |
| Low | 2 |
| Informational | 4 |






## Alerts

| Name | Risk Level | Number of Instances |
| --- | --- | --- |
| Private IP Disclosure | Low | 1 |
| Strict-Transport-Security Header Not Set | Low | Systemic |
| A Client Error response code was returned by the server | Informational | 86 |
| Authentication Request Identified | Informational | 1 |
| Non-Storable Content | Informational | 3 |
| Storable and Cacheable Content | Informational | Systemic |




## Alert Detail



### [ Private IP Disclosure ](https://www.zaproxy.org/docs/alerts/2/)



##### Low (Medium)

### Description

A private IP (such as 10.x.x.x, 172.x.x.x, 192.168.x.x) or an Amazon EC2 private hostname (for example, ip-10-0-56-78) has been found in the HTTP response body. This information might be helpful for further attacks targeting internal systems.

* URL: http://host.docker.internal:3333/api/documentation-json
  * Node Name: `http://host.docker.internal:3333/api/documentation-json`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `192.168.1.1`
  * Other Info: `192.168.1.1
`


Instances: 1

### Solution

Remove the private IP address from the HTTP response body. For comments, use JSP/ASP/PHP comment instead of HTML/JavaScript comment which can be seen by client browsers.

### Reference


* [ https://datatracker.ietf.org/doc/html/rfc1918 ](https://datatracker.ietf.org/doc/html/rfc1918)


#### CWE Id: [ 497 ](https://cwe.mitre.org/data/definitions/497.html)


#### WASC Id: 13

#### Source ID: 3

### [ Strict-Transport-Security Header Not Set ](https://www.zaproxy.org/docs/alerts/10035/)



##### Low (High)

### Description

HTTP Strict Transport Security (HSTS) is a web security policy mechanism whereby a web server declares that complying user agents (such as a web browser) are to interact with it using only secure HTTPS connections (i.e. HTTP layered over TLS/SSL). HSTS is an IETF standards track protocol and is specified in RFC 6797.

* URL: https://kaaiya-backend.onrender.com/api/auth/me
  * Node Name: `https://kaaiya-backend.onrender.com/api/auth/me`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: https://kaaiya-backend.onrender.com/api/auth/login
  * Node Name: `https://kaaiya-backend.onrender.com/api/auth/login ()({email,password})`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: https://kaaiya-backend.onrender.com/api/auth/logout
  * Node Name: `https://kaaiya-backend.onrender.com/api/auth/logout`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: https://kaaiya-backend.onrender.com/api/auth/register
  * Node Name: `https://kaaiya-backend.onrender.com/api/auth/register ()({email,nombre,password,rol})`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: ``
  * Other Info: ``
* URL: https://kaaiya-backend.onrender.com/api/auth/me
  * Node Name: `https://kaaiya-backend.onrender.com/api/auth/me ()({nombre})`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: ``
  * Other Info: ``

Instances: Systemic


### Solution

Ensure that your web server, application server, load balancer, etc. is configured to enforce Strict-Transport-Security.

### Reference


* [ https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Strict_Transport_Security_Cheat_Sheet.html ](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Strict_Transport_Security_Cheat_Sheet.html)
* [ https://owasp.org/www-community/Security_Headers ](https://owasp.org/www-community/Security_Headers)
* [ https://en.wikipedia.org/wiki/HTTP_Strict_Transport_Security ](https://en.wikipedia.org/wiki/HTTP_Strict_Transport_Security)
* [ https://caniuse.com/stricttransportsecurity ](https://caniuse.com/stricttransportsecurity)
* [ https://datatracker.ietf.org/doc/html/rfc6797 ](https://datatracker.ietf.org/doc/html/rfc6797)


#### CWE Id: [ 319 ](https://cwe.mitre.org/data/definitions/319.html)


#### WASC Id: 15

#### Source ID: 3

### [ A Client Error response code was returned by the server ](https://www.zaproxy.org/docs/alerts/100000/)



##### Informational (High)

### Description

A response code of 404 was returned by the server.
This may indicate that the application is failing to handle unexpected input correctly.
Raised by the 'Alert on HTTP Response Code Error' script

* URL: https://kaaiya-backend.onrender.com/api/auth/usuarios/1.2
  * Node Name: `https://kaaiya-backend.onrender.com/api/auth/usuarios/1.2`
  * Method: `DELETE`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://kaaiya-backend.onrender.com/api/empresas/1.2/logo
  * Node Name: `https://kaaiya-backend.onrender.com/api/empresas/1.2/logo`
  * Method: `DELETE`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://kaaiya-backend.onrender.com/api/organizaciones/1.2/logo
  * Node Name: `https://kaaiya-backend.onrender.com/api/organizaciones/1.2/logo`
  * Method: `DELETE`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://kaaiya-backend.onrender.com/api/proyectos/1.2/galeria/imagenId
  * Node Name: `https://kaaiya-backend.onrender.com/api/proyectos/1.2/galeria/imagenId`
  * Method: `DELETE`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://kaaiya-backend.onrender.com/api/proyectos/1.2/imagen-principal
  * Node Name: `https://kaaiya-backend.onrender.com/api/proyectos/1.2/imagen-principal`
  * Method: `DELETE`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://kaaiya-backend.onrender.com/api/publicaciones/id
  * Node Name: `https://kaaiya-backend.onrender.com/api/publicaciones/id`
  * Method: `DELETE`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://host.docker.internal:3333
  * Node Name: `http://host.docker.internal:3333`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://host.docker.internal:3333/
  * Node Name: `http://host.docker.internal:3333/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://host.docker.internal:3333/7805864545941981116
  * Node Name: `http://host.docker.internal:3333/7805864545941981116`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://host.docker.internal:3333/actuator/health
  * Node Name: `http://host.docker.internal:3333/actuator/health`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://host.docker.internal:3333/api
  * Node Name: `http://host.docker.internal:3333/api`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://host.docker.internal:3333/api/
  * Node Name: `http://host.docker.internal:3333/api/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://host.docker.internal:3333/api/2446210658847346571
  * Node Name: `http://host.docker.internal:3333/api/2446210658847346571`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://host.docker.internal:3333/computeMetadata/v1/
  * Node Name: `http://host.docker.internal:3333/computeMetadata/v1/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://host.docker.internal:3333/latest/meta-data/
  * Node Name: `http://host.docker.internal:3333/latest/meta-data/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://host.docker.internal:3333/metadata/instance
  * Node Name: `http://host.docker.internal:3333/metadata/instance`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://host.docker.internal:3333/metadata/v1
  * Node Name: `http://host.docker.internal:3333/metadata/v1`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://host.docker.internal:3333/opc/v1/instance/
  * Node Name: `http://host.docker.internal:3333/opc/v1/instance/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://host.docker.internal:3333/opc/v2/instance/
  * Node Name: `http://host.docker.internal:3333/opc/v2/instance/`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: http://host.docker.internal:3333/openstack/latest/meta_data.json
  * Node Name: `http://host.docker.internal:3333/openstack/latest/meta_data.json`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://kaaiya-backend.onrender.com/api/actores-municipales/forms
  * Node Name: `https://kaaiya-backend.onrender.com/api/actores-municipales/forms`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://kaaiya-backend.onrender.com/api/admin/logs%3Fpage=1&limit=10&tipo=aplicacion&severidad=info&usuario_id=1.2&fecha_desde=2026-01-01&fecha_hasta=2026-12-31
  * Node Name: `https://kaaiya-backend.onrender.com/api/admin/logs (fecha_desde,fecha_hasta,limit,page,severidad,tipo,usuario_id)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://kaaiya-backend.onrender.com/api/apoyos/forms
  * Node Name: `https://kaaiya-backend.onrender.com/api/apoyos/forms`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://kaaiya-backend.onrender.com/api/areas
  * Node Name: `https://kaaiya-backend.onrender.com/api/areas`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://kaaiya-backend.onrender.com/api/areas-desarrollo
  * Node Name: `https://kaaiya-backend.onrender.com/api/areas-desarrollo`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://kaaiya-backend.onrender.com/api/auth/me
  * Node Name: `https://kaaiya-backend.onrender.com/api/auth/me`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://kaaiya-backend.onrender.com/api/auth/solicitudes%3Fpage=1&limit=10&estado=pendiente
  * Node Name: `https://kaaiya-backend.onrender.com/api/auth/solicitudes (estado,limit,page)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://kaaiya-backend.onrender.com/api/auth/usuarios%3Fpage=1&limit=10&rol=1&activo=true&search=Mar%25C3%25ADa
  * Node Name: `https://kaaiya-backend.onrender.com/api/auth/usuarios (activo,limit,page,rol,search)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://kaaiya-backend.onrender.com/api/auth/usuarios/1.2
  * Node Name: `https://kaaiya-backend.onrender.com/api/auth/usuarios/1.2`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://kaaiya-backend.onrender.com/api/ayudas/forms
  * Node Name: `https://kaaiya-backend.onrender.com/api/ayudas/forms`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://kaaiya-backend.onrender.com/api/dashboard/empresas%3Fpage=1&limit=10&departamento=1&forma_juridica=1&motivo=1&apoyo=1&ods=13&search=Amazona&sort=nombre:asc
  * Node Name: `https://kaaiya-backend.onrender.com/api/dashboard/empresas (apoyo,departamento,forma_juridica,limit,motivo,ods,page,search,sort)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://kaaiya-backend.onrender.com/api/dashboard/empresas/1.2
  * Node Name: `https://kaaiya-backend.onrender.com/api/dashboard/empresas/1.2`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://kaaiya-backend.onrender.com/api/dashboard/filtros-disponibles
  * Node Name: `https://kaaiya-backend.onrender.com/api/dashboard/filtros-disponibles`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://kaaiya-backend.onrender.com/api/dashboard/por-region
  * Node Name: `https://kaaiya-backend.onrender.com/api/dashboard/por-region`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://kaaiya-backend.onrender.com/api/dashboard/por-tipo%3Fdepartamento=2&area=1
  * Node Name: `https://kaaiya-backend.onrender.com/api/dashboard/por-tipo (area,departamento)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://kaaiya-backend.onrender.com/api/dashboard/proyectos%3Fpage=1&limit=10&area=1&departamento=1&municipio=49&comunidad=22&tipo=1&ayuda=2&actor=1&activo=true&anio_desde=2020&anio_hasta=2025&search=jaguar&sort=anio_inicio:desc
  * Node Name: `https://kaaiya-backend.onrender.com/api/dashboard/proyectos (activo,actor,anio_desde,anio_hasta,area,ayuda,comunidad,departamento,limit,municipio,page,search,sort,tipo)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://kaaiya-backend.onrender.com/api/dashboard/proyectos/1.2
  * Node Name: `https://kaaiya-backend.onrender.com/api/dashboard/proyectos/1.2`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://kaaiya-backend.onrender.com/api/dashboard/publico/por-region
  * Node Name: `https://kaaiya-backend.onrender.com/api/dashboard/publico/por-region`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://kaaiya-backend.onrender.com/api/dashboard/publico/resumen
  * Node Name: `https://kaaiya-backend.onrender.com/api/dashboard/publico/resumen`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://kaaiya-backend.onrender.com/api/dashboard/resumen
  * Node Name: `https://kaaiya-backend.onrender.com/api/dashboard/resumen`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://kaaiya-backend.onrender.com/api/dashboard/salud
  * Node Name: `https://kaaiya-backend.onrender.com/api/dashboard/salud`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://kaaiya-backend.onrender.com/api/dashboard/timeline
  * Node Name: `https://kaaiya-backend.onrender.com/api/dashboard/timeline`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://kaaiya-backend.onrender.com/api/departamentos%3Fpage=1&limit=10&amazonico=true
  * Node Name: `https://kaaiya-backend.onrender.com/api/departamentos (amazonico,limit,page)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://kaaiya-backend.onrender.com/api/empresas%3Fpage=1&limit=10&departamento=3&forma_juridica=1&search=Amazonia&sort=nombre:asc
  * Node Name: `https://kaaiya-backend.onrender.com/api/empresas (departamento,forma_juridica,limit,page,search,sort)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://kaaiya-backend.onrender.com/api/empresas/1.2
  * Node Name: `https://kaaiya-backend.onrender.com/api/empresas/1.2`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://kaaiya-backend.onrender.com/api/empresas/filtros-disponibles
  * Node Name: `https://kaaiya-backend.onrender.com/api/empresas/filtros-disponibles`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://kaaiya-backend.onrender.com/api/especies-animales/forms
  * Node Name: `https://kaaiya-backend.onrender.com/api/especies-animales/forms`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://kaaiya-backend.onrender.com/api/formas-juridicas/forms
  * Node Name: `https://kaaiya-backend.onrender.com/api/formas-juridicas/forms`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://kaaiya-backend.onrender.com/api/health
  * Node Name: `https://kaaiya-backend.onrender.com/api/health`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://kaaiya-backend.onrender.com/api/health/ready
  * Node Name: `https://kaaiya-backend.onrender.com/api/health/ready`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://kaaiya-backend.onrender.com/api/motivos/forms
  * Node Name: `https://kaaiya-backend.onrender.com/api/motivos/forms`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://kaaiya-backend.onrender.com/api/municipios%3Fpage=1&limit=10&departamento=3&search=Trinidad
  * Node Name: `https://kaaiya-backend.onrender.com/api/municipios (departamento,limit,page,search)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://kaaiya-backend.onrender.com/api/municipios/10/comunidades
  * Node Name: `https://kaaiya-backend.onrender.com/api/municipios/10/comunidades`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://kaaiya-backend.onrender.com/api/ods
  * Node Name: `https://kaaiya-backend.onrender.com/api/ods`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://kaaiya-backend.onrender.com/api/organizaciones%3Fpage=1&limit=10&departamento=3&esNacional=true&tipo=2&search=Fundaci%25C3%25B3n
  * Node Name: `https://kaaiya-backend.onrender.com/api/organizaciones (departamento,esNacional,limit,page,search,tipo)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://kaaiya-backend.onrender.com/api/organizaciones/1.2
  * Node Name: `https://kaaiya-backend.onrender.com/api/organizaciones/1.2`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://kaaiya-backend.onrender.com/api/organizaciones/filtros-disponibles
  * Node Name: `https://kaaiya-backend.onrender.com/api/organizaciones/filtros-disponibles`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://kaaiya-backend.onrender.com/api/practicas-agricolas/forms
  * Node Name: `https://kaaiya-backend.onrender.com/api/practicas-agricolas/forms`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://kaaiya-backend.onrender.com/api/proyectos%3Fpage=1&limit=10&area=1&departamento=3&tipo=2&anio=2023&search=Reforestaci%25C3%25B3n&municipio=10&anio_desde=2020&anio_hasta=2024&sort=anioInicio:desc
  * Node Name: `https://kaaiya-backend.onrender.com/api/proyectos (anio,anio_desde,anio_hasta,area,departamento,limit,municipio,page,search,sort,tipo)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://kaaiya-backend.onrender.com/api/proyectos/1.2
  * Node Name: `https://kaaiya-backend.onrender.com/api/proyectos/1.2`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://kaaiya-backend.onrender.com/api/proyectos/filtros-disponibles
  * Node Name: `https://kaaiya-backend.onrender.com/api/proyectos/filtros-disponibles`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://kaaiya-backend.onrender.com/api/proyectos/map
  * Node Name: `https://kaaiya-backend.onrender.com/api/proyectos/map`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://kaaiya-backend.onrender.com/api/publicaciones%3Fpage=1&limit=10&estado=borrador&autor_id=1.2
  * Node Name: `https://kaaiya-backend.onrender.com/api/publicaciones (autor_id,estado,limit,page)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://kaaiya-backend.onrender.com/api/publicaciones/el-jaguar-amazonia-a1b2c3d4
  * Node Name: `https://kaaiya-backend.onrender.com/api/publicaciones/el-jaguar-amazonia-a1b2c3d4`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://kaaiya-backend.onrender.com/api/publicaciones/mias%3Fpage=1&limit=10&estado=borrador&autor_id=1.2
  * Node Name: `https://kaaiya-backend.onrender.com/api/publicaciones/mias (autor_id,estado,limit,page)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://kaaiya-backend.onrender.com/api/tipos-organizaciones/forms
  * Node Name: `https://kaaiya-backend.onrender.com/api/tipos-organizaciones/forms`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://kaaiya-backend.onrender.com/api/tipos-proyectos/forms
  * Node Name: `https://kaaiya-backend.onrender.com/api/tipos-proyectos/forms`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://kaaiya-backend.onrender.com/api/auth/solicitudes/1.2/aprobar
  * Node Name: `https://kaaiya-backend.onrender.com/api/auth/solicitudes/1.2/aprobar ()({fechaExpiracionAcceso,passwordTemporal})`
  * Method: `PATCH`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://kaaiya-backend.onrender.com/api/auth/solicitudes/1.2/rechazar
  * Node Name: `https://kaaiya-backend.onrender.com/api/auth/solicitudes/1.2/rechazar ()({notaRechazo})`
  * Method: `PATCH`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://kaaiya-backend.onrender.com/api/auth/usuarios/1.2
  * Node Name: `https://kaaiya-backend.onrender.com/api/auth/usuarios/1.2 ()({nombre,activo,rol})`
  * Method: `PATCH`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://kaaiya-backend.onrender.com/api/publicaciones/id
  * Node Name: `https://kaaiya-backend.onrender.com/api/publicaciones/id ()({titulo,contenido:[{tipo,texto,url,descripcion}],estado})`
  * Method: `PATCH`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://kaaiya-backend.onrender.com/api/auth/change-password
  * Node Name: `https://kaaiya-backend.onrender.com/api/auth/change-password ()({currentPassword,newPassword})`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://kaaiya-backend.onrender.com/api/auth/login
  * Node Name: `https://kaaiya-backend.onrender.com/api/auth/login ()({email,password})`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://kaaiya-backend.onrender.com/api/auth/logout
  * Node Name: `https://kaaiya-backend.onrender.com/api/auth/logout`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://kaaiya-backend.onrender.com/api/auth/register
  * Node Name: `https://kaaiya-backend.onrender.com/api/auth/register ()({email,nombre,password,rol})`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://kaaiya-backend.onrender.com/api/auth/solicitar-acceso
  * Node Name: `https://kaaiya-backend.onrender.com/api/auth/solicitar-acceso ()({nombreSolicitante,emailSolicitante,institucion,proposito})`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://kaaiya-backend.onrender.com/api/empresas/1.2/logo
  * Node Name: `https://kaaiya-backend.onrender.com/api/empresas/1.2/logo ()(multipart:file)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://kaaiya-backend.onrender.com/api/formularios/empresas
  * Node Name: `https://kaaiya-backend.onrender.com/api/formularios/empresas ()({nombre,formaJuridica:{id,otro},departamentos:[{}],anioInicioApoyo,apoyos:{seleccionados:[{}],otros:[]},organizaciones:[],motivosApoyo:{seleccionados:[{}],otros:[]},ods:[{}],proyectos:[{fechaInicio,fechaFin,nombre,descripcion,anioInicio,anioFin,tipo:{id,otros},departamento,municipiosTrabajo:[{idMunicipio,idComunidadIndigena}],ayudas:{seleccionados:[{}],otros:[]},actores:{seleccionados:[{}],otros:[]},area,conservacion:{especies:{seleccionados:[{}],otros:[]},practicasAgricolas:{seleccionados:[{}],otros:[]}...)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://kaaiya-backend.onrender.com/api/formularios/organizaciones
  * Node Name: `https://kaaiya-backend.onrender.com/api/formularios/organizaciones ()({nombre,idDepartamento,esNacional,tipo:{id,otros},anioInicioTrabajo,proyectos:[{fechaInicio,fechaFin,nombre,descripcion,anioInicio,anioFin,tipo:{id,otros},departamento,municipiosTrabajo:[{idMunicipio,idComunidadIndigena}],ayudas:{seleccionados:[{}],otros:[]},actores:{seleccionados:[{}],otros:[]},area,conservacion:{especies:{seleccionados:[{}],otros:[]},practicasAgricolas:{seleccionados:[{}],otros:[]}},desarrollo:{seleccionados:[{}],otros:[]},lat,lng}],proyectosExistentes:[{idProyecto,fechaInicio,fechaFin}]})`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://kaaiya-backend.onrender.com/api/organizaciones/1.2/logo
  * Node Name: `https://kaaiya-backend.onrender.com/api/organizaciones/1.2/logo ()(multipart:file)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://kaaiya-backend.onrender.com/api/proyectos/1.2/galeria
  * Node Name: `https://kaaiya-backend.onrender.com/api/proyectos/1.2/galeria ()(multipart:file,descripcion)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://kaaiya-backend.onrender.com/api/proyectos/1.2/imagen-principal
  * Node Name: `https://kaaiya-backend.onrender.com/api/proyectos/1.2/imagen-principal ()(multipart:file)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://kaaiya-backend.onrender.com/api/publicaciones
  * Node Name: `https://kaaiya-backend.onrender.com/api/publicaciones ()({titulo,contenido:[{tipo,texto,url,descripcion}],estado})`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://kaaiya-backend.onrender.com/api/publicaciones/id/imagenes
  * Node Name: `https://kaaiya-backend.onrender.com/api/publicaciones/id/imagenes ()(multipart:file,descripcion)`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://kaaiya-backend.onrender.com/api/auth/me
  * Node Name: `https://kaaiya-backend.onrender.com/api/auth/me ()({nombre})`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``
* URL: https://kaaiya-backend.onrender.com/api/proyectos/1.2/galeria/orden
  * Node Name: `https://kaaiya-backend.onrender.com/api/proyectos/1.2/galeria/orden ()([])`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `404`
  * Other Info: ``


Instances: 86

### Solution



### Reference



#### CWE Id: [ 388 ](https://cwe.mitre.org/data/definitions/388.html)


#### WASC Id: 20

#### Source ID: 4

### [ Authentication Request Identified ](https://www.zaproxy.org/docs/alerts/10111/)



##### Informational (High)

### Description

The given request has been identified as an authentication request. The 'Other Info' field contains a set of key=value lines which identify any relevant fields. If the request is in a context which has an Authentication Method set to "Auto-Detect" then this rule will change the authentication to match the request identified.

* URL: https://kaaiya-backend.onrender.com/api/auth/login
  * Node Name: `https://kaaiya-backend.onrender.com/api/auth/login ()({email,password})`
  * Method: `POST`
  * Parameter: `email`
  * Attack: ``
  * Evidence: `password`
  * Other Info: `userParam=email
userValue=zaproxy@example.com
passwordParam=password`


Instances: 1

### Solution

This is an informational alert rather than a vulnerability and so there is nothing to fix.

### Reference


* [ https://www.zaproxy.org/docs/desktop/addons/authentication-helper/auth-req-id/ ](https://www.zaproxy.org/docs/desktop/addons/authentication-helper/auth-req-id/)



#### Source ID: 3

### [ Non-Storable Content ](https://www.zaproxy.org/docs/alerts/10049/)



##### Informational (Medium)

### Description

The response contents are not storable by caching components such as proxy servers. If the response does not contain sensitive, personal or user-specific information, it may benefit from being stored and cached, to improve performance.

* URL: https://kaaiya-backend.onrender.com/api/auth/solicitudes/1.2/aprobar
  * Node Name: `https://kaaiya-backend.onrender.com/api/auth/solicitudes/1.2/aprobar ()({fechaExpiracionAcceso,passwordTemporal})`
  * Method: `PATCH`
  * Parameter: ``
  * Attack: ``
  * Evidence: `PATCH `
  * Other Info: ``
* URL: https://kaaiya-backend.onrender.com/api/auth/usuarios/1.2
  * Node Name: `https://kaaiya-backend.onrender.com/api/auth/usuarios/1.2 ()({nombre,activo,rol})`
  * Method: `PATCH`
  * Parameter: ``
  * Attack: ``
  * Evidence: `PATCH `
  * Other Info: ``
* URL: https://kaaiya-backend.onrender.com/api/auth/me
  * Node Name: `https://kaaiya-backend.onrender.com/api/auth/me ()({nombre})`
  * Method: `PUT`
  * Parameter: ``
  * Attack: ``
  * Evidence: `PUT `
  * Other Info: ``


Instances: 3

### Solution

The content may be marked as storable by ensuring that the following conditions are satisfied:
The request method must be understood by the cache and defined as being cacheable ("GET", "HEAD", and "POST" are currently defined as cacheable)
The response status code must be understood by the cache (one of the 1XX, 2XX, 3XX, 4XX, or 5XX response classes are generally understood)
The "no-store" cache directive must not appear in the request or response header fields
For caching by "shared" caches such as "proxy" caches, the "private" response directive must not appear in the response
For caching by "shared" caches such as "proxy" caches, the "Authorization" header field must not appear in the request, unless the response explicitly allows it (using one of the "must-revalidate", "public", or "s-maxage" Cache-Control response directives)
In addition to the conditions above, at least one of the following conditions must also be satisfied by the response:
It must contain an "Expires" header field
It must contain a "max-age" response directive
For "shared" caches such as "proxy" caches, it must contain a "s-maxage" response directive
It must contain a "Cache Control Extension" that allows it to be cached
It must have a status code that is defined as cacheable by default (200, 203, 204, 206, 300, 301, 404, 405, 410, 414, 501).

### Reference


* [ https://datatracker.ietf.org/doc/html/rfc7234 ](https://datatracker.ietf.org/doc/html/rfc7234)
* [ https://datatracker.ietf.org/doc/html/rfc7231 ](https://datatracker.ietf.org/doc/html/rfc7231)
* [ https://www.w3.org/Protocols/rfc2616/rfc2616-sec13.html ](https://www.w3.org/Protocols/rfc2616/rfc2616-sec13.html)


#### CWE Id: [ 524 ](https://cwe.mitre.org/data/definitions/524.html)


#### WASC Id: 13

#### Source ID: 3

### [ Storable and Cacheable Content ](https://www.zaproxy.org/docs/alerts/10049/)



##### Informational (Medium)

### Description

The response contents are storable by caching components such as proxy servers, and may be retrieved directly from the cache, rather than from the origin server by the caching servers, in response to similar requests from other users. If the response data is sensitive, personal or user-specific, this may result in sensitive information being leaked. In some cases, this may even result in a user gaining complete control of the session of another user, depending on the configuration of the caching components in use in their environment. This is primarily an issue where "shared" caching servers such as "proxy" caches are configured on the local network. This configuration is typically found in corporate or educational environments, for instance.

* URL: http://host.docker.internal:3333/api/documentation-json
  * Node Name: `http://host.docker.internal:3333/api/documentation-json`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: ``
  * Other Info: `In the absence of an explicitly specified caching lifetime directive in the response, a liberal lifetime heuristic of 1 year was assumed. This is permitted by rfc7234.`
* URL: https://kaaiya-backend.onrender.com/api/auth/me
  * Node Name: `https://kaaiya-backend.onrender.com/api/auth/me`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: ``
  * Other Info: `In the absence of an explicitly specified caching lifetime directive in the response, a liberal lifetime heuristic of 1 year was assumed. This is permitted by rfc7234.`
* URL: https://kaaiya-backend.onrender.com/api/auth/usuarios%3Fpage=1&limit=10&rol=1&activo=true&search=Mar%25C3%25ADa
  * Node Name: `https://kaaiya-backend.onrender.com/api/auth/usuarios (activo,limit,page,rol,search)`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: ``
  * Other Info: `In the absence of an explicitly specified caching lifetime directive in the response, a liberal lifetime heuristic of 1 year was assumed. This is permitted by rfc7234.`
* URL: https://kaaiya-backend.onrender.com/api/auth/change-password
  * Node Name: `https://kaaiya-backend.onrender.com/api/auth/change-password ()({currentPassword,newPassword})`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: ``
  * Other Info: `In the absence of an explicitly specified caching lifetime directive in the response, a liberal lifetime heuristic of 1 year was assumed. This is permitted by rfc7234.`
* URL: https://kaaiya-backend.onrender.com/api/auth/login
  * Node Name: `https://kaaiya-backend.onrender.com/api/auth/login ()({email,password})`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: ``
  * Other Info: `In the absence of an explicitly specified caching lifetime directive in the response, a liberal lifetime heuristic of 1 year was assumed. This is permitted by rfc7234.`
* URL: https://kaaiya-backend.onrender.com/api/auth/register
  * Node Name: `https://kaaiya-backend.onrender.com/api/auth/register ()({email,nombre,password,rol})`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: ``
  * Other Info: `In the absence of an explicitly specified caching lifetime directive in the response, a liberal lifetime heuristic of 1 year was assumed. This is permitted by rfc7234.`

Instances: Systemic


### Solution

Validate that the response does not contain sensitive, personal or user-specific information. If it does, consider the use of the following HTTP response headers, to limit, or prevent the content being stored and retrieved from the cache by another user:
Cache-Control: no-cache, no-store, must-revalidate, private
Pragma: no-cache
Expires: 0
This configuration directs both HTTP 1.0 and HTTP 1.1 compliant caching servers to not store the response, and to not retrieve the response (without validation) from the cache, in response to a similar request.

### Reference


* [ https://datatracker.ietf.org/doc/html/rfc7234 ](https://datatracker.ietf.org/doc/html/rfc7234)
* [ https://datatracker.ietf.org/doc/html/rfc7231 ](https://datatracker.ietf.org/doc/html/rfc7231)
* [ https://www.w3.org/Protocols/rfc2616/rfc2616-sec13.html ](https://www.w3.org/Protocols/rfc2616/rfc2616-sec13.html)


#### CWE Id: [ 524 ](https://cwe.mitre.org/data/definitions/524.html)


#### WASC Id: 13

#### Source ID: 3


