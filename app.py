from flask import Flask
from flask_cors import CORS

import models
from resources.units import units_api
from resources.abilities import abilities_api

app = Flask(__name__)
app.register_blueprint(units_api, url_prefix="/api/v1")
app.register_blueprint(abilities_api, url_prefix="/api/v1")
CORS(app, support_credentials=True)
models.initialize()

if __name__ == "__main__":
    app.run()
