'use strict';
module.exports = (sequelize, DataTypes) => {
  const company = sequelize.define('company', {
    name: DataTypes.STRING(50),
    hash: DataTypes.STRING(300)
  }, {});
  company.associate = function(models) {
    // associations can be defined here
  };
  return company;
};