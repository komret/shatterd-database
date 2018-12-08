new Vue({
    el: "#app",
    data: {
        units: [],
        unitHiddenAttributes: [
            "id",
            "editUnit"
        ],
        unitAttributes: [
            {name: "name", type: "title"},
            {name: "faction", type: "title"},
            {name: "race", type: "title"},
            {name: "archetype", type: "archetype"},
            {name: "health", type: "stat"},
            {name: "move_speed", type: "stat"},
            {name: "attack_range", type: "attackRangeStat"},
            {name: "attack_speed", type: "stat"},
            {name: "base_damage", type: "stat"},
            {name: "reduction", type: "stat"},
            {name: "bio", type: "text"},
            {name: "offensive_abilities", type: "title"},
            {name: "defensive_abilities", type: "title"}
        ],
        unitArchetypes: [
            "Guardian",
            "Bruiser",
            "Assassin",
            "Berserker",
            "Runner",
            "Brute",
            "Swarm",
            "Dragon",
            "Cannon",
            "Thrower",
            "Archer",
            "Ranger",
            "Sharpshooter",
            "Mage",
            "Repeater"
        ],
        unitStats: [
            "lowest",
            "low",
            "average",
            "high",
            "highest"
        ],
        unitAttackRangeStats: [
            "melee",
            "lowest",
            "low",
            "average",
            "high",
            "highest"
        ],
        unitOrder: {},
        unitFilters: {},
        abilities: [],
    },
    mounted() {
        this.getData("units");
        this.getData("abilities");
    },
    methods: {
        makeReadable: function (attribute) {
            return attribute.split("_").map((word) => word.charAt(0).toUpperCase() + word.substring(1)).join(" ")
        },
        getData: function (data) {
            fetch("http://127.0.0.1:5000/api/v1/" + data)
                .then(response => response.json())
                .then(jsonData => this[data] =
                    this.orderData(this.filterData(jsonData[data], this.unitFilters), this.unitOrder));
        },
        getType: function (attribute) {
            return (this.unitAttributes.find(att => att.name === attribute)).type
        },
        isSelected: function (key, option) {
            return key === option
        },
        orderData: function (data, attribute) {
            if (attribute.type === "stat") {
                data.sort((a, b) => {
                    if (this.unitStats.indexOf(a[attribute.name]) !== this.unitStats.indexOf(b[attribute.name])) {
                        return this.unitStats.indexOf(a[attribute.name]) - this.unitStats.indexOf(b[attribute.name])
                    } else {
                        return a.id - b.id
                    }
                })
            } else if ((attribute.type === "attackRangeStat")) {
                data.sort((a, b) => {
                    if (this.unitAttackRangeStats.indexOf(a[attribute.name]) !==
                        this.unitAttackRangeStats.indexOf(b[attribute.name])) {
                        return this.unitAttackRangeStats.indexOf(a[attribute.name]) -
                            this.unitAttackRangeStats.indexOf(b[attribute.name])
                    } else {
                        return a.id - b.id
                    }
                })
            } else {
                data.sort((a, b) => {
                    if (a[attribute.name] !== b[attribute.name]) {
                        return a[attribute.name] < b[attribute.name] ? -1 : 1
                    } else {
                        return a.id - b.id
                    }
                })
            }
            if (this.unitOrder.desc) {
                data.reverse()
            }
            return data
        },
        orderDirectly: function (attribute) {
            if (this.unitOrder.name === attribute.name) {
                this.unitOrder.desc = !this.unitOrder.desc
            }
            this.unitOrder = attribute;
            this.orderData(this.units, attribute)
        },
        filterData: function (data, attributes) {
            Object.entries(attributes).forEach(([key, value]) => {
                data = data.filter(item => item[key].toLowerCase() === value)
            });
            return data
        },
        addFilter: function (attribute) {
            this.unitFilters[attribute.name] =
                document.querySelector("#filter_units_" + attribute.name).value.toLowerCase();
            if (this.unitFilters[attribute.name]) {
                this.getData("units")
            } else {
                this.units = this.filterData(this.units, this.unitFilters);
            }
        },
        reset: function () {
            this.unitOrder = {};
            this.unitFilters = {};
            document.querySelectorAll(".filter").forEach(filter => filter.value = "---filter---");
            document.querySelectorAll(".search").forEach(filter => filter.value = "");
            this.getData("units");
        },
        addUnit: function () {
            const attributes = {};
            this.unitAttributes.forEach(attribute => {
                attributes[attribute.name] =
                    document.querySelector("#add_unit_" + attribute.name).value
            });
            fetch("http://127.0.0.1:5000/api/v1/units", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(attributes)
            })
                .then(() => this.getData("units"));
            this.unitAttributes.forEach(attribute => {
                document.querySelector("#add_unit_" + attribute.name).value = ""
            })
        },
        addAbility: function () {
            const name = document.querySelector("#addAbilityName").value;
            const effect = document.querySelector("#addAbilityEffect").value;
            fetch("http://127.0.0.1:5000/api/v1/abilities", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({name, effect})
            })
                .then(() => this.getData("abilities"));
            document.querySelector("#addAbilityName").value = "";
            document.querySelector("#addAbilityEffect").value = "";
        },
        deleteUnit: function (unit) {
            fetch("http://127.0.0.1:5000/api/v1/unit/" + unit.id, {
                    method: "DELETE"
                }
            )
                .then(() => this.getData("units"))
        },
        deleteAbility: function (ability, index) {
            fetch("http://127.0.0.1:5000/api/v1/ability/" + ability.id, {
                    method: "DELETE"
                }
            );
            this.abilities.splice(index, 1)
        },
        editUnit: function (unit) {
            Vue.set(unit, "editUnit", true)
        },
        editAbility: function (ability) {
            Vue.set(ability, "editAbility", true)
        },
        saveUnit: function (unit) {
            const attributes = {};
            this.unitAttributes.forEach(attribute => {
                attributes[attribute.name] =
                    document.querySelector("#edit_unit_" + attribute.name + unit.id).value
            });
            fetch("http://127.0.0.1:5000/api/v1/unit/" + unit.id, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(attributes)
            })
                .then(() => this.getData("units"))
                .then(() => unit.editUnit = false)
        },
        saveAbility: function (ability) {
            fetch("http://127.0.0.1:5000/api/v1/ability/" + ability.id, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: document.querySelector("#editAbilityName").value,
                    effect: document.querySelector("#editAbilityEffect").value
                })
            });
            ability.editAbility = false;
            ability.name = document.querySelector("#editAbilityName").value;
            ability.effect = document.querySelector("#editAbilityEffect").value
        }
    }
});
