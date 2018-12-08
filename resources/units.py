from flask import Blueprint, url_for
from flask_restful import Api, Resource, fields, marshal, marshal_with, reqparse

import models

unit_fields = {
    "id": fields.Integer,
    "name": fields.String,
    "faction": fields.String,
    "race": fields.String,
    "archetype": fields.String,
    "health": fields.String,
    "move_speed": fields.String,
    "attack_range": fields.String,
    "attack_speed": fields.String,
    "base_damage": fields.String,
    "reduction": fields.String,
    "bio": fields.String,
    "offensive_abilities": fields.String,
    "defensive_abilities": fields.String
}


class BaseUnit(Resource):
    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        for key in unit_fields.keys():
            if key != "id":
                self.reqparse.add_argument(key, location=["json"])
        super().__init__()


class Units(BaseUnit):
    @staticmethod
    def get():
        units = [marshal(unit, unit_fields) for unit in models.Unit.select()]
        return {"units": units}, 200

    @marshal_with(unit_fields)
    def post(self):
        args = self.reqparse.parse_args()
        unit = models.Unit.create(**args)
        return unit, 201, {"Location": url_for("resources.units.unit", id=unit.id)}


class Unit(BaseUnit):
    @staticmethod
    @marshal_with(unit_fields)
    def get(id):
        return models.Unit.get(models.Unit.id == id), 200

    @marshal_with(unit_fields)
    def put(self, id):
        args = self.reqparse.parse_args()
        query = models.Unit.update(**args).where(models.Unit.id == id)
        query.execute()
        unit = models.Unit.get(models.Unit.id == id)
        return unit, 200, {"Location": url_for("resources.units.unit", id=id)}

    @staticmethod
    def delete(id):
        query = models.Unit.delete().where(models.Unit.id == id)
        query.execute()
        return "", 204, {"Location": url_for("resources.units.units")}


units_api = Blueprint("resources.units", __name__)
api = Api(units_api)
api.add_resource(
    Units,
    "/units"
)
api.add_resource(
    Unit,
    "/unit/<int:id>"
)
