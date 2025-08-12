# Cómo abrir la Pull Request

Ejecuta estos comandos desde la raíz del repo (o dentro de `apps/mobile` según tu flujo):

```bash
git checkout -b feat/mobile-actions-quote
git add .
git commit -m "feat(mobile): Done/Skip con eliminación inmediata, brief y frase motivadora diaria con persistencia"
git push -u origin feat/mobile-actions-quote
```

Luego, abre la PR en GitHub:

- URL directa: `https://github.com/Weniw7/mentor-ai/pull/new/feat/mobile-actions-quote`
- O desde la UI de GitHub, selecciona la rama `feat/mobile-actions-quote` y crea la PR hacia `main`.

Título de la PR:

```
Mobile: acciones Done/Skip + frase motivadora + persistencia
```

Descripción sugerida:

```
Archivos cambiados/creados:
- apps/mobile/src/store/useTasksStore.ts
- apps/mobile/src/services/motivation.ts
- apps/mobile/src/screens/TodayScreen.tsx

Pruebas manuales esperadas:
- Ver frase motivadora arriba + brief debajo.
- Pulsar Done/Skip elimina la tarea al instante de la lista (y persiste al reabrir).
- Pull-to-refresh genera nuevas tareas y recalcula brief/quote.
```