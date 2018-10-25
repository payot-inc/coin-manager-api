'use strict';
module.exports = (sequelize, DataTypes) => {
  const franchise = sequelize.define('franchise', {
    name: DataTypes.STRING
  }, {});
  franchise.associate = function(models) {
    // associations can be defined here
  };
  return franchise;
};