const express = require('express')
const platformSettingsModel = require('../models/platformSettings.model')

const router = express.Router()

router.get('/settings', async (req, res, next) => {
  try {
    const settings = await platformSettingsModel.getSettings()
    res.status(200).json({ settings })
  } catch (error) {
    next(error)
  }
})

module.exports = router
