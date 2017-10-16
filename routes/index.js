const express = require('express')
const router = express.Router()
const Cosmic = require('cosmicjs')
const async = require('async')
const _ = require('lodash')
const axios = require('axios')

router.get('/', (req, res) => {
  const config = req.app.locals.cosmicConfig
  async.series({
    siteSettings(callback) {
      Cosmic.getObject(config, { slug: 'site-settings' }, (error, response) => {
        callback(null, response.object.metadata)
      })
    },
    homePage(callback) {
      Cosmic.getObject(config, { slug: 'home-page' }, (error, response) => {
        callback(null, response.object.metadata)
      })
    },
    tourDates(callback) {
      Cosmic.getObjectsByType(config, { type_slug: 'tour-dates' }, (error, response) => {
        callback(null, response.objects.all)
      })
    }
  }, (err, results) => {
    res.locals.settings = results.siteSettings
    res.locals.homepage = results.homePage
    const socials = {
      twitter: results.siteSettings.twitter,
      instagram: results.siteSettings.instagram,
      youtube: results.siteSettings.youtube,
      apple: results.siteSettings.apple_music,
      spotify: results.siteSettings.spotify,
      bandcamp: results.siteSettings.bandcamp
    }
    res.locals.socials = socials
    res.locals.tourDates = _.sortBy(results.tourDates, tourDate => (
      tourDate.metadata.date
    )).slice(0,3)
    res.locals.title = results.siteSettings.band_name

    res.render('index.handlebars')
  })
})

router.get('/tour', async (req, res) => {
  const config = req.app.locals.cosmicConfig
  async.series({
    siteSettings(callback) {
      Cosmic.getObject(config, { slug: 'site-settings' }, (error, response) => {
        callback(null, response.object.metadata)
      })
    },
    tourDates(callback) {
      Cosmic.getObjectsByType(config, { type_slug: 'tour-dates' }, (error, response) => {
        callback(null, response.objects.all)
      })
    }
  }, (err, results) => {
    res.locals.settings = results.siteSettings
    const socials = {
      twitter: results.siteSettings.twitter,
      instagram: results.siteSettings.instagram,
      youtube: results.siteSettings.youtube,
      apple: results.siteSettings.apple_music,
      spotify: results.siteSettings.spotify,
      bandcamp: results.siteSettings.bandcamp
    }
    res.locals.socials = socials
    res.locals.tourDates = _.sortBy(results.tourDates, tourDate => (
      tourDate.metadata.date
    ))
    res.locals.title = results.siteSettings.band_name + ' | Tour Dates'

    res.render('tour.handlebars')
  })
})

router.get('/photo-gallery', (req, res) => {
  const config = req.app.locals.cosmicConfig
  async.series({
    siteSettings(callback) {
      Cosmic.getObject(config, { slug: 'site-settings' }, (error, response) => {
        callback(null, response.object.metadata)
      })
    },
    galleries(callback) {
      Cosmic.getObjectsByType(config, { type_slug: 'galleries' }, (error, response) => {
        callback(null, response.objects.all)
      })
    }
  }, (err, results) => {
      res.locals.settings = results.siteSettings
      const socials = {
        twitter: results.siteSettings.twitter,
        instagram: results.siteSettings.instagram,
        youtube: results.siteSettings.youtube,
        apple: results.siteSettings.apple_music,
        spotify: results.siteSettings.spotify,
        bandcamp: results.siteSettings.bandcamp
      }
      res.locals.socials = socials
      res.locals.title = results.siteSettings.band_name + ' | Photo Gallery'
      res.locals.galleries = results.galleries
      res.render('gallery.handlebars')
  })
})

router.get('/photo-gallery/:slug', (req, res) => {
  const config = req.app.locals.cosmicConfig
  async.series({
    siteSettings(callback) {
      Cosmic.getObject(config, { slug: 'site-settings' }, (error, response) => {
        callback(null, response.object.metadata)
      })
    },
    album(callback) {
      Cosmic.getObject(config, { slug: req.params.slug }, (err, response) => {
        callback(null, response.object)
      })
    }
  }, (err, results) => {
      res.locals.settings = results.siteSettings
      const socials = {
        twitter: results.siteSettings.twitter,
        instagram: results.siteSettings.instagram,
        youtube: results.siteSettings.youtube,
        apple: results.siteSettings.apple_music,
        spotify: results.siteSettings.spotify,
        bandcamp: results.siteSettings.bandcamp
      }
      res.locals.socials = socials
      res.locals.title = results.siteSettings.band_name + ' | ' + results.album.title
      res.locals.album = results.album
      res.locals.photos = results.album.metadata.photos
      res.render('album.handlebars')
  })
})

router.get('/videos', (req, res) => {
  const config = req.app.locals.cosmicConfig
  async.series({
    siteSettings(callback) {
      Cosmic.getObject(config, { slug: 'site-settings' }, (error, response) => {
        callback(null, response.object.metadata)
      })
    },
    videos(callback) {
      Cosmic.getObjectsByType(config, { type_slug: 'videos' }, (error, response) => {
        callback(null, response.objects.all)
      })
    }
  }, (err, results) => {
    res.locals.settings = results.siteSettings
    const socials = {
      twitter: results.siteSettings.twitter,
      instagram: results.siteSettings.instagram,
      youtube: results.siteSettings.youtube,
      apple: results.siteSettings.apple_music,
      spotify: results.siteSettings.spotify,
      bandcamp: results.siteSettings.bandcamp
    }
    res.locals.socials = socials
    res.locals.title = results.siteSettings.band_name + ' | Videos'
    res.locals.videos = results.videos
    res.render('videos.handlebars')
  })
})

router.get('/bio', (req, res) => {
  const config = req.app.locals.cosmicConfig
  async.series({
    siteSettings(callback) {
      Cosmic.getObject(config, { slug: 'site-settings' }, (error, response) => {
        callback(null, response.object.metadata)
      })
    }
  }, (err, results) => {
    res.locals.settings = results.siteSettings
    const socials = {
      twitter: results.siteSettings.twitter,
      instagram: results.siteSettings.instagram,
      youtube: results.siteSettings.youtube,
      apple: results.siteSettings.apple_music,
      spotify: results.siteSettings.spotify,
      bandcamp: results.siteSettings.bandcamp
    }
    res.locals.socials = socials
    res.locals.title = results.siteSettings.band_name + ' | Bio'
    res.render('bio.handlebars')
  })
})

router.post('/signup', (req, res) => {
  const email = req.body.email
  axios.post(`https://${process.env.MAILCHIMP_DC}.api.mailchimp.com/3.0/lists/${process.env.MAILCHIMP_LIST_ID}/members/`, {
    auth: {
      url: `https://${process.env.MAILCHIMP_DC}.api.mailchimp.com/3.0/`,
      user: `anystring:${process.env.MAILCHIMP_KEY}`
    },
    body: {
      "email_address": email,
      "status": "subscribed"
    }
  }).then(success => {
      res.redirect('/?subscribed=true')
  }).catch(err => {
    res.redirect('/?subscribed=false')
  })
})

module.exports = router;
