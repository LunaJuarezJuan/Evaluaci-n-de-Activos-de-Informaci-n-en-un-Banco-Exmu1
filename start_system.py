#!/usr/bin/env python3
"""
Script de inicio para el Sistema de Auditoría de Sistemas Bancarios
Este script verifica las dependencias y inicia tanto el backend como el frontend
"""

import subprocess
import sys
import time
import requests
import os
from pathlib import Path

def check_python_dependencies():
    """Verifica que las dependencias de Python estén instaladas"""
    try:
        import flask
        import flask_cors
        import openai
        print("✅ Dependencias de Python instaladas correctamente")
        return True
    except ImportError as e:
        print(f"❌ Faltan dependencias de Python: {e}")
        print("Ejecuta: pip install -r requirements.txt")
        return False

def check_ollama_connection():
    """Verifica que Ollama esté ejecutándose"""
    try:
        response = requests.get("http://localhost:11434/api/tags", timeout=5)
        if response.status_code == 200:
            print("✅ Ollama está ejecutándose correctamente")
            return True
    except requests.exceptions.RequestException:
        pass
    
    print("❌ Ollama no está ejecutándose")
    print("Inicia Ollama con: ollama serve")
    return False

def check_node_dependencies():
    """Verifica que las dependencias de Node.js estén instaladas"""
    if not Path("node_modules").exists():
        print("❌ Dependencias de Node.js no instaladas")
        print("Ejecuta: npm install")
        return False
    
    print("✅ Dependencias de Node.js instaladas")
    return True

def start_backend():
    """Inicia el servidor backend Flask"""
    print("🚀 Iniciando servidor backend...")
    try:
        subprocess.Popen([sys.executable, "app.py"], 
                        stdout=subprocess.DEVNULL, 
                        stderr=subprocess.DEVNULL)
        time.sleep(3)  # Esperar a que el servidor inicie
        
        # Verificar que el backend esté funcionando
        response = requests.get("http://localhost:5500/api/status", timeout=5)
        if response.status_code == 200:
            print("✅ Backend iniciado correctamente en http://localhost:5500")
            return True
    except Exception as e:
        print(f"❌ Error al iniciar el backend: {e}")
    
    return False

def start_frontend():
    """Inicia el servidor frontend React"""
    print("🚀 Iniciando servidor frontend...")
    try:
        subprocess.Popen(["npm", "run", "dev"], 
                        stdout=subprocess.DEVNULL, 
                        stderr=subprocess.DEVNULL)
        time.sleep(5)  # Esperar a que el servidor inicie
        
        # Verificar que el frontend esté funcionando
        response = requests.get("http://localhost:5173", timeout=5)
        if response.status_code == 200:
            print("✅ Frontend iniciado correctamente en http://localhost:5173")
            return True
    except Exception as e:
        print(f"❌ Error al iniciar el frontend: {e}")
    
    return False

def main():
    """Función principal"""
    print("=" * 60)
    print("🏦 SISTEMA DE AUDITORÍA DE SISTEMAS BANCARIOS")
    print("=" * 60)
    
    # Verificaciones previas
    if not check_python_dependencies():
        return
    
    if not check_node_dependencies():
        return
    
    if not check_ollama_connection():
        print("\n⚠️  Advertencia: Sin Ollama, el sistema usará perfiles de riesgo predefinidos")
    
    print("\n" + "=" * 60)
    print("🚀 INICIANDO SISTEMA...")
    print("=" * 60)
    
    # Iniciar servicios
    backend_ok = start_backend()
    frontend_ok = start_frontend()
    
    if backend_ok and frontend_ok:
        print("\n" + "=" * 60)
        print("✅ SISTEMA INICIADO CORRECTAMENTE")
        print("=" * 60)
        print("🌐 Frontend: http://localhost:5173")
        print("🔧 Backend API: http://localhost:5500")
        print("📊 Estado del sistema: http://localhost:5500/api/status")
        print("\n👤 Credenciales de acceso:")
        print("   Usuario: admin")
        print("   Contraseña: 123456")
        print("\n💡 Presiona Ctrl+C para detener el sistema")
        print("=" * 60)
        
        try:
            # Mantener el script ejecutándose
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            print("\n🛑 Sistema detenido por el usuario")
    else:
        print("\n❌ Error al iniciar el sistema")
        print("Verifica los logs anteriores para más detalles")

if __name__ == "__main__":
    main()
