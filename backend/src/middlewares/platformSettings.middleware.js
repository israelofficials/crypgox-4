const platformSettingsModel = require('../models/platformSettings.model')

const platformSettingsMiddleware = async (req, res, next) => {
  try {
    const settings = await platformSettingsModel.getSettings()
    req.platformSettings = settings
    res.locals.platformSettings = settings
    next()
  } catch (error) {
    next(error)
  }
}

module.exports = platformSettingsMiddleware
