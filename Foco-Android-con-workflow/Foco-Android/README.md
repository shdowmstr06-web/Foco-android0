# Foco para Android (proyecto APK)

Este proyecto adapta Foco a una app Android nativa contenedora de WebView. Conserva el temporizador, tareas y subtareas, estadísticas, mascotas, evolución, monedas, minijuegos, tienda, habitación y guardado local. Incluye la pestaña Foco Pro (temas, hábitats exclusivos, informe semanal, +50% de monedas). Se ha quitado el panel de IA, el panel de pruebas de desarrollador y la mini ventana de Electron.

## Crear el APK

1. Instala Android Studio y el SDK Android 35 (API 35).
2. Descomprime `Foco-Android.zip`.
3. En Android Studio elige **Open** y selecciona la carpeta `Foco-Android`.
4. Espera a que termine la sincronización de Gradle. Acepta la instalación de componentes si Android Studio lo pide.
5. Para un APK instalable de prueba: **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
6. Android Studio mostrará un enlace al APK; normalmente queda en `app/build/outputs/apk/debug/app-debug.apk`.

## Instalar en el teléfono

Copia el APK al teléfono, ábrelo y permite instalar aplicaciones desde esa fuente si Android te lo solicita.

## Notas

- Los datos se guardan localmente en el almacenamiento del WebView de esta instalación.
- La app solicita permiso para notificaciones; la notificación del temporizador funciona cuando Android permite que el aviso se publique.
- El temporizador y los sonidos están pensados para funcionar con Foco abierto en primer plano. Android puede pausar actividad cuando la app queda en segundo plano o el teléfono se bloquea.
- La exportación guarda `foco-progreso.json` en Descargas; la importación abre el selector de archivos.
- Este paquete contiene el proyecto fuente listo para compilar con Android Studio; no contiene un APK ya compilado.

- Foco Pro se activa con la misma contraseña de prototipo de la versión de escritorio; la licencia se guarda en el dispositivo (SharedPreferences). No hay cobro real.
