'use strict';
module.exports = (sequelize, DataTypes) => {
  const user = sequelize.define('user', {
    phone: DataTypes.STRING
  }, {});
  user.associate = function(models) {
    // associations can be defined here
    user.belongsTo(models.company)
  };
  return user;
};