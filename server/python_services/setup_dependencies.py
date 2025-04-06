import subprocess
import sys
import json
import os

def install_dependencies():
    required_packages = [
        'textblob',
        'vaderSentiment',
        'googletrans==4.0.0-rc1',
        'numpy'
    ]
    
    results = {
        "success": True,
        "installed": [],
        "errors": []
    }
    
    for package in required_packages:
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", "-q", package])
            results["installed"].append(package)
        except Exception as e:
            results["success"] = False
            results["errors"].append(f"Error installing {package}: {str(e)}")
    
    try:
        import nltk
        nltk.download('punkt', quiet=True)
        nltk.download('averaged_perceptron_tagger', quiet=True)
        results["installed"].append("nltk_data")
    except Exception as e:
        results["success"] = False
        results["errors"].append(f"Error downloading NLTK data: {str(e)}")
    
    print(json.dumps(results))

# Add these environment variables
os.environ['CUBLAS_WORKSPACE_CONFIG'] = ':4096:8'
os.environ['PYTHONHASHSEED'] = '42'

if __name__ == "__main__":
    install_dependencies() 