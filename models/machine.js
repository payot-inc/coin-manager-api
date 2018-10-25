'use strict';
module.exports = (sequelize, DataTypes) => {
  const machine = sequelize.define('machine', {
    mac: DataTypes.STRING
  }, {});
  machine.associate = function(models) {
    // associations can be defined here
  };
  return machine;
};