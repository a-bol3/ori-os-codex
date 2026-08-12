# ORI-OS — Modelo operativo multiagente

## Objetivo

Este documento define cómo trabajará el equipo de agentes para llevar ORI-OS a
producción y distribución sin duplicar trabajo, introducir cambios incompatibles
ni perder trazabilidad.

## Roles

### Orquestador (`/root`)

- Mantiene el mapa global del producto y el orden de prioridades.
- Divide el trabajo en tareas pequeñas con un único propietario.
- Decide qué cambios se integran y en qué orden.
- Revisa conflictos, regresiones, criterios de aceptación y evidencia de release.
- Es el único rol que declara un bloque terminado.

### Agente de seguridad y cumplimiento

Responsable de autenticación, sesiones, tenancy, RBAC, auditoría, GDPR/DSAR,
secretos, dependencias y límites de datos.

### Agente de producto y funcionalidad

Responsable de CRM, Dashboard, Engagement, Deliverability y recorridos de usuario.
Debe validar siempre interfaz, API, persistencia, permisos, errores y pruebas.

### Agente de release e infraestructura

Responsable de builds, CI, despliegue, nginx/PM2/Docker, VPS, backups,
restauración, observabilidad, health checks, rollback y capacidad.

## Reglas de trabajo

1. Cada tarea tiene un único agente propietario y una ruta de archivos explícita.
2. Antes de editar, el agente entrega diagnóstico y criterio de aceptación.
3. Los cambios de esquema, autenticación, contratos API y despliegue requieren
   revisión del orquestador antes de integrarse.
4. Ningún agente puede introducir datos demo, secretos en código o bypasses de
   autorización para hacer pasar una prueba.
5. Todo cambio debe incluir pruebas proporcionales al riesgo y evidencia de
   verificación.
6. Si un agente encuentra un bloqueo fuera de su ámbito, lo registra y lo
   comunica; no modifica la zona de otro agente sin autorización.
7. Una tarea se cierra solo con: cambio, pruebas, documentación y rollback o
   recuperación conocida cuando aplique.

## Formato de entrega de cada agente

```text
Estado: DONE | BLOCKED | NEEDS_REVIEW
Objetivo:
Archivos afectados:
Cambios realizados:
Pruebas ejecutadas y resultado:
Riesgos o deuda restante:
Siguiente acción recomendada:
```

## Flujo de integración

1. Auditoría breve y definición de alcance.
2. Implementación aislada.
3. Pruebas locales del agente.
4. Revisión del orquestador.
5. Pruebas cruzadas (API, web, worker, base de datos).
6. Smoke test en staging.
7. Despliegue con rollback preparado.
8. Evidencia archivada en `docs/` y actualización del backlog.

## Comunicación entre agentes

Los agentes no se coordinan mediante cambios implícitos. Toda dependencia se
expresa como una nota de entrega con:

- contrato o archivo que se consume;
- supuestos;
- datos de prueba;
- comportamiento esperado;
- comportamiento ante fallo;
- responsable de la siguiente acción.

## Política de credenciales durante la fase actual

Por decisión del propietario, no se rotarán ahora las credenciales existentes.
Se mantienen para staging/beta controlada y no deben copiarse a commits, logs,
capturas, tickets ni respuestas.

La rotación será un gate obligatorio antes de distribución pública. El orquestador
debe emitir literalmente la alerta:

> ES TIEMPO DE ROTAR FINALMENTE LAS CREDENCIALES

La alerta se activa cuando se cumplan simultáneamente:

- beta validada y sin necesidad de conservar las credenciales actuales;
- variables de producción finales preparadas;
- proveedor de correo y dominios verificados;
- procedimiento de rollback probado;
- ventana de cambio aprobada.

## Gates de producto

- **Gate A — Desarrollo:** builds y pruebas críticas pasan; fixtures solo en
  desarrollo explícito.
- **Gate B — Staging:** recorridos CRM/Engagement/GDPR reproducibles, sin mocks
  silenciosos, con observabilidad y rollback.
- **Gate C — Beta privada:** aislamiento multiempresa auditado, soporte operativo,
  backups restaurables y proveedor de correo aceptado para bajo volumen.
- **Gate D — Distribución:** credenciales rotadas, billing/cancelación/exportación
  validados, límites por plan, monitorización y documentación legal coherente.

## Prioridad de ejecución

1. Bloqueos de disponibilidad, autenticación o aislamiento de datos.
2. Recorridos de negocio CRM y Engagement de extremo a extremo.
3. GDPR, auditoría, exportación, borrado y retención.
4. Release, backups, observabilidad y rollback.
5. UX, rendimiento y accesibilidad.
6. Módulos comerciales y distribución.
