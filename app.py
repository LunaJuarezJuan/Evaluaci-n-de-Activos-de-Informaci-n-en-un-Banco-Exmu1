from openai import OpenAI
from flask import Flask, send_from_directory, request, jsonify, Response
from flask_cors import CORS
import re
import json

app = Flask(__name__)
CORS(app)  # Habilitar CORS para comunicación con React

# Ruta para servir el index.html desde la carpeta dist
@app.route('/',  methods=["GET",'POST'])
def serve_index():
    return send_from_directory('dist', 'index.html')

# Ruta para servir los archivos estáticos generados
@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('dist', path)

client = OpenAI(
    base_url = 'http://localhost:11434/v1',
    api_key='ollama', # required, but unused
)

@app.route('/analizar-riesgos-bancarios', methods=['POST'])
def analizar_riesgos_bancarios():
    data = request.get_json()
    activo = data.get('activo')
    if not activo:
        return jsonify({"error": "El campo 'activo' es necesario"}), 400
    
    try:
        # Generar perfil de riesgo bancario con IA
        perfil_riesgo = generar_perfil_riesgo_bancario(activo)
        return jsonify({
            "activo": activo,
            "riesgo": perfil_riesgo["riesgo"],
            "impacto": perfil_riesgo["impacto"],
            "probabilidad": perfil_riesgo["probabilidad"],
            "categoria": perfil_riesgo["categoria"]
        })
    except Exception as e:
        return jsonify({"error": f"Error en el análisis de IA: {str(e)}"}), 500

@app.route('/generar-tratamiento-iso27001', methods=['POST'])
def generar_tratamiento_iso27001():
    data = request.get_json()
    activo = data.get('activo')
    riesgo = data.get('riesgo')
    impacto = data.get('impacto')
    categoria = data.get('categoria', 'Medio')
    probabilidad = data.get('probabilidad', 'Media')

    if not activo or not riesgo or not impacto:
        return jsonify({"error": "Los campos 'activo', 'riesgo' e 'impacto' son necesarios"}), 400

    try:
        # Generar tratamiento ISO 27001 con IA
        tratamiento = generar_tratamiento_iso27001_ia(activo, riesgo, impacto, categoria, probabilidad)
        return jsonify({
            "activo": activo,
            "riesgo": riesgo,
            "impacto": impacto,
            "categoria": categoria,
            "probabilidad": probabilidad,
            "tratamiento": tratamiento
        })
    except Exception as e:
        return jsonify({"error": f"Error en la generación de tratamiento: {str(e)}"}), 500

@app.route('/api/status', methods=['GET'])
def api_status():
    """Endpoint para verificar el estado del sistema de IA"""
    try:
        # Verificar conexión con Ollama
        response = client.chat.completions.create(
            model="ramiro:instruct",
            messages=[{"role": "user", "content": "test"}]
        )
        return jsonify({
            "status": "operational",
            "ai_engine": "ollama",
            "model": "ramiro:instruct",
            "message": "Sistema de IA funcionando correctamente"
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "ai_engine": "ollama",
            "error": str(e),
            "message": "Error en la conexión con el motor de IA"
        }), 500

@app.route('/api/activos-bancarios', methods=['GET'])
def obtener_activos_bancarios():
    """Endpoint para obtener lista de activos bancarios predefinidos"""
    activos = [
        {"id": 1, "nombre": "Servidor de base de datos", "tipo": "Base de Datos", "criticidad": "Crítico"},
        {"id": 2, "nombre": "API Transacciones", "tipo": "Servicio Web", "criticidad": "Crítico"},
        {"id": 3, "nombre": "Aplicación Web de Banca", "tipo": "Aplicación", "criticidad": "Alto"},
        {"id": 4, "nombre": "Servidor de Correo", "tipo": "Infraestructura", "criticidad": "Medio"},
        {"id": 5, "nombre": "Firewall Perimetral", "tipo": "Seguridad", "criticidad": "Crítico"},
        {"id": 6, "nombre": "Autenticación MFA", "tipo": "Seguridad", "criticidad": "Alto"},
        {"id": 7, "nombre": "Registros de Auditoría", "tipo": "Información", "criticidad": "Alto"},
        {"id": 8, "nombre": "Backup en NAS", "tipo": "Almacenamiento", "criticidad": "Crítico"},
        {"id": 9, "nombre": "Servidor DNS Interno", "tipo": "Red", "criticidad": "Medio"},
        {"id": 10, "nombre": "Plataforma de Pagos Móviles", "tipo": "Aplicación", "criticidad": "Crítico"}
    ]
    return jsonify({"activos": activos})

def generar_perfil_riesgo_bancario(activo):
    """Genera un perfil de riesgo específico para activos bancarios usando IA"""
    response = client.chat.completions.create(
        model="ramiro:instruct",
        messages=[
            {
                "role": "system", 
                "content": """Eres un auditor de sistemas especializado en banca. Analiza el activo de información bancario y genera un perfil de riesgo completo. 
                Responde en formato JSON con las siguientes claves:
                - "riesgo": descripción del riesgo principal (máximo 100 caracteres)
                - "impacto": descripción del impacto en el banco (máximo 150 caracteres)  
                - "probabilidad": "Baja", "Media" o "Alta"
                - "categoria": "Crítico", "Alto", "Medio" o "Bajo"
                
                Considera regulaciones bancarias, PCI DSS, y estándares ISO 27001."""
            },
            {
                "role": "user", 
                "content": f"Analiza este activo bancario: {activo}"
            }
        ]
    )
    
    try:
        # Intentar parsear la respuesta JSON
        answer = response.choices[0].message.content
        perfil = json.loads(answer)
        
        # Validar que tenga todos los campos requeridos
        campos_requeridos = ["riesgo", "impacto", "probabilidad", "categoria"]
        for campo in campos_requeridos:
            if campo not in perfil:
                raise ValueError(f"Campo {campo} no encontrado en la respuesta")
        
        return perfil
    except (json.JSONDecodeError, ValueError) as e:
        # Si falla el parsing, usar perfil por defecto
        return {
            "riesgo": f"Vulnerabilidad en {activo} identificada mediante análisis de seguridad",
            "impacto": "Impacto potencial en operaciones bancarias y cumplimiento regulatorio",
            "probabilidad": "Media",
            "categoria": "Medio"
        }

def generar_tratamiento_iso27001_ia(activo, riesgo, impacto, categoria, probabilidad):
    """Genera recomendaciones de tratamiento alineadas con ISO 27001 usando IA"""
    response = client.chat.completions.create(
        model="ramiro:instruct",
        messages=[
            {
                "role": "system", 
                "content": """Eres un consultor de seguridad especializado en ISO 27001 para el sector bancario. 
                Genera recomendaciones de tratamiento específicas con referencias a controles ISO 27001.
                Incluye al menos 3 controles ISO 27001 con sus códigos (ej: A.12.6.1, A.9.1.1).
                Máximo 200 caracteres por recomendación.
                Enfócate en controles críticos para el sector bancario."""
            },
            {
                "role": "user", 
                "content": f"Activo: {activo}, Riesgo: {riesgo}, Impacto: {impacto}, Categoría: {categoria}, Probabilidad: {probabilidad}"
            }
        ]
    )
    
    answer = response.choices[0].message.content
    return answer
def obtener_riesgos( activo ):
    response = client.chat.completions.create(
    model="ramiro:instruct",
    messages=[
    {"role": "system", "content": "Responde en español, eres una herramienta para gestion de riesgos de la iso 27000, el usuario, te ingresara un asset tecnologico y tu responderas con 5 posibles riesgos asociados en bullets."},
    {"role": "user", "content": "mi raspberry pi"},
    {"role": "assistant",  "content": """• **Acceso no autorizado**: terceros pueden acceder a la información almacenada o procesada en el Raspberry Pi sin permiso, lo que podría llevar a la revelación de datos confidenciales.

• **Pérdida o daño de datos**: los archivos y datos almacenados en el Raspberry Pi se pierden o dañan debido a un error en el sistema, un fallo en el hardware o una acción malintencionada.

• **Vulnerabilidades de seguridad**: El software o firmware instalados en el Raspberry Pi contienen vulnerabilidades de seguridad no detectadas y son explotados por un atacante.

• **Inseguridad de la conexión**: la conexión del Raspberry Pi a la red local o internet no esté segura y un atacante intercepta datos confidenciales o inyecta malware en el sistema.

• **Fallos hardware**: daño debido a causas como sobrecalentamiento, sobrecarga eléctrica o errores en la manufactura, lo que lleva a una pérdida de datos o inoperatividad del sistema.""" },
    {"role": "user", "content": activo }
  ]
)
    answer = response.choices[0].message.content
    patron = r'\*\*\s*(.+?)\*\*:\s*(.+?)\.(?=\s*\n|\s*$)'
    
    # Buscamos todos los patrones en la respuesta
    resultados = re.findall(patron, answer)
    
    # Separamos los resultados en dos listas: riesgos e impactos
    riesgos = [resultado[0] for resultado in resultados]
    impactos = [resultado[1] for resultado in resultados]
    
    return riesgos, impactos

#riesgos, impactos = obtener_riesgos("mi telefono movil")

if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0", port="5500")