# DT Content Agent / Studio — Diseño MVP

## Objetivo

Evolucionar el Content Studio existente para generar Content Packs manualmente desde un producto, guardarlos en Supabase y revisarlos antes de publicar. El MVP no publica automáticamente ni usa IA externa.

## Alcance

- Razones soportadas: `manual` y `new_product`.
- Salidas: caption, 2–4 stories conversacionales, reel con hook/tomas/texto/CTA, hashtags y concepto visual.
- Bandeja interna protegida por el acceso admin/PIN actual.
- Estados: `draft`, `approved`, `rejected`.
- Acciones: generar, guardar, editar, aprobar, rechazar y regenerar.
- Reutilizar tipos, templates y `ContentCard` existentes; no reemplazar el catálogo público.

## Persistencia

Crear una tabla de packs en Supabase con el producto identificado, razón, payload JSON del contenido, estado y timestamps. La UI sólo podrá operar desde el área interna existente. La generación local seguirá funcionando aunque Supabase no esté configurado, mostrando un error accionable al intentar guardar.

## Arquitectura de UI

El Studio tendrá dos modos internos: creación desde producto y bandeja. La bandeja mostrará primero los borradores, con filtros de estado y producto. Cada pack se edita en una vista de detalle reutilizando tarjetas de contenido; los cambios se guardan explícitamente. Regenerar crea un nuevo borrador conservando el pack anterior.

## Calidad de contenido

Mantener templates locales, pero estructurar stories y reel para que sean breves, naturales y accionables. Evitar saturación publicitaria y texto excesivo en el concepto visual. El brand kit será una constante tipada con paleta crema/beige/camel/marrón/negro/dorado y dirección cálida, premium accesible y lifestyle.

## No incluido

Detección automática de eventos, cron jobs, calendario, publicación de Instagram, métricas, aprendizaje, generación de imágenes/vídeo y llamadas a OpenAI/Claude.

## Validación

- Tests unitarios para generación, serialización y transiciones de estado.
- `npm run lint` y `npm run build`.
- Verificación manual del flujo: seleccionar producto → generar → guardar → editar → aprobar/rechazar → recargar.
