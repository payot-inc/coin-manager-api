'use strict';
module.exports = (sequelize, DataTypes) => {
  const sms = sequelize.define('sms', {
    message: DataTypes.STRING
  }, {});
  sms.associate = function(models) {
    // associations can be defined here
  };
  return sms;
};