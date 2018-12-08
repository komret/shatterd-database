from flask import Blueprint, url_for
from flask_restful import Api, Resource, fields, marshal, marshal_with, reqparse

import models

ability_fields = {
    "id": fields.Integer,
    "name": fields.String,
    "effect": fields.String,
}


class BaseAbility(Resource):
    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument(
            "name",
            required=True,
            help="No name provided",
            location=["json"]
        )
        self.reqparse.add_argument(
            "effect",
            required=True,
            help="No faction provided",
            location=["json"]
        )
        super().__init__()


class Abilities(BaseAbility):
    @staticmethod
    def get():
        abilities = [marshal(ability, ability_fields) for ability in models.Ability.select()]
        return {"abilities": abilities}, 200

    @marshal_with(ability_fields)
    def post(self):
        args = self.reqparse.parse_args()
        ability = models.Ability.create(**args)
        return ability, 201, {"Location": url_for("resources.abilities.ability", id=ability.id)}


class Ability(BaseAbility):
    @staticmethod
    @marshal_with(ability_fields)
    def get(id):
        return models.Ability.get(models.Ability.id == id), 200

    @marshal_with(ability_fields)
    def put(self, id):
        args = self.reqparse.parse_args()
        query = models.Ability.update(**args).where(models.Ability.id == id)
        query.execute()
        ability = models.Ability.get(models.Ability.id == id)
        return ability, 200, {"Location": url_for("resources.abilities.ability", id=id)}

    @staticmethod
    def delete(id):
        query = models.Ability.delete().where(models.Ability.id == id)
        query.execute()
        return "", 204, {"Location": url_for("resources.abilities.abilities")}


abilities_api = Blueprint("resources.abilities", __name__)
api = Api(abilities_api)
api.add_resource(
    Abilities,
    "/abilities"
)
api.add_resource(
    Ability,
    "/ability/<int:id>"
)
