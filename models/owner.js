'use strict';
module.exports = (sequelize, DataTypes) => {
  const owner = sequelize.define('owner', {
    name: DataTypes.STRING
  }, {});
  owner.associate = function(models) {
    // associations can be defined here
  };
  return owner;
};