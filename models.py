from peewee import *

db = SqliteDatabase("shattered.db")


class BaseModel(Model):
    name = CharField()

    class Meta:
        database = db


class Unit(BaseModel):
    faction = CharField()
    race = CharField()
    archetype = CharField()
    health = CharField()
    move_speed = CharField()
    attack_range = CharField()
    attack_speed = CharField()
    base_damage = CharField()
    reduction = CharField()
    bio = CharField()
    offensive_abilities = CharField()
    defensive_abilities = CharField()


class Ability(BaseModel):
    effect = CharField()


def initialize():
    db.connect()
    db.create_tables([Unit, Ability], safe=True)
    db.close()
