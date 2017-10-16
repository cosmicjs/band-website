# How to Build a Website for Your Band With CosmicJS

When you're laser focused on writing songs, getting the most out of your studio time, and finding gigs, you can't be bothered with setting up a static site for your band or dealing with abstruse CMS systems. When you want easy access to your data, want to know where everything is, and want to be able to write a simple, predictable app for yourself, Cosmic JS should be the most obvious choice.

CosmicJS is an API-first CMS, meaning it is language independent, database independent, and practically everything-else independent. This is great for a small project like this one because we can extend it quickly with any language or framework in the future and we can define data structures that are only as complex as we need them to be.

Our band site needs to have the following features:

1. Tour dates, so our fans know where they can see us
2. A photo gallery, because looking cool is just as important as sounding good
3. A video gallery, because photos get boring
4. A biography, so new fans can learn what we're about
5. A mailing list signup form, so we can market to our fans

Our site will be built as an Express app, integrate with Mailchimp to handle email signups, and will have all of its data served entirely from Cosmic JS. It will be deployed through Cosmic as well.

##Part 0: Setting Up CosmicJS

We'll use three Object types in Cosmic to structure our data.

1. Tour Dates - for storing gig information
2. Galleries - for storing photo albums
3. Videos - for storing links to Youtube videos
4. Settings - for storing site settings

We'll set up each Object type with predefined metafields like so:

**Tour Dates**

| **Metafield Name** | **Type** |
| ------------------ | -------- |
| Location           | text     |
| Venue              | text     |
| Date               | date     |
| Ticket Link        | text     |

**Galleries**

| **Metafield Name** | **Type**         |
| ------------------ | ---------------- |
| Photos             | repeater (photo) |
| Date               | date             |

**Videos**

| **Metafield Name** | **Type** |
| ------------------ | -------- |
| Embed Code         | text     |

(The Settings type won't have predefiend metafields — we'll set those as we need them)

## Part 1. Boilerplate Setup 

To save time on boilerplate, we'll use Yeoman and the Express Generator (which builds on Express' official generator) to get started. If you don't have Yeoman installed, run ```npm i -g yo```. Then install the generator with ```npm i -g generator-express``` and run it with ```yo express```. Follow the instructions to set up your project under a new directory (say ```CosmicUserBlog```), install the *Basic* version, and use Handlebars for your view engine.

Your directory structure is now this:

```bash
CosmicUserBlog
| 
|--bin
|   |--www
|--(node_modules)
|--public
|--routes
|    |--users.js
     |--index.js
|--views
     |--layouts
     |--partials
     |--error.handlebars
     |--index.handlebars
|--.bowerrc
|--.gitignore
|--app.js
|--bower.json
|--gruntfile.js
|--package.json
```

## Part 2. Installations

We'll be using the following packages:

- Async - A powerful async utilities library
- Axios - Simple, promise based http requests
- Cors - Standard cors middleware
- CosmicJs - The official client
- Moment - to format dates
- TruncateHTML - for HTML safe text shortening
- Lodash - for its various utilities

You could install these with npm, but I advocate for Yarn. It's significantly faster and we have no time to waste. So install Yarn (on macOS we'll do a ```brew install yarn```) then run ```yarn add async axios cors cosmicjs moment truncate-html lodash```.

## Part 3. Configure the App

Within ```app.js```, import the packages we just installed and declare a ```config``` object to be used with the Cosmic JS client:

```javascript
// app.js

const truncate = require('truncate-html')
const moment = require('moment')
const exphbs  = require('express-handlebars')

var config = {
    bucket: {
        slug: process.env.COSMIC_BUCKET,
     	read_key: process.env.COSMIC_READ_KEY,
      	write_key: process.env.COSMIC_WRITE_KEY
    }
}
app.locals.cosmicConfig = config
```

We assign it to ```app.locals``` to use it in our routes.

### Site Settings

We want to be able to display certain data globally throughout the site and we'll store it in a Cosmic JS object to make it easy to edit, rather than having to redeploy our site everytime something needs changed. In your Cosmic dashboard, make a ```Settings``` object called ```Site Settings`	`` with the following metafields (filling them as desired).



| **Metafield** | **Type**  | **Value**                                |
| ------------- | --------- | ---------------------------------------- |
| Band Name     | text      | (your band's name)                       |
| Logo          | image     | (your band's logo)                       |
| Twitter       | text      | (link to your band's Twitter)            |
| Instagram     | text      | (link to your band's Instagram)          |
| Youtube       | text      | (link to your band's Youtube channel)    |
| Apple Music   | text      | (link to your band's Apple Music page)   |
| Spotify       | text      | (link to your band's Spotify page)       |
| Bandcamp      | text      | (link to your band's Bandcamp profile)   |
| Bio           | text area | A biography of your band                 |
| Music Link    | text      | (link to your band's primary music hub, e.g. Soundcloud) |
| Bio Header    | image     | A header image for your band's bio page  |

### Styles

To make things easy, we'll also start off with predefined styles. Copy and paste this into ```/public/css/style.scss``` (when we run/build our app later, Gulp will handle the compilation):

```scss
// public/css/style.scss

@import url('https://fonts.googleapis.com/css?family=Poppins');
@import url('https://fonts.googleapis.com/css?family=Nixie+One');

$lightBlue: #03adee;
$orange: #EE7E03;
$darkBlue: #0175A1;


html {
  height: 100%
}

body {
  font-family: 'Poppins', sans-serif;
  background: #212121;
  height: 100%
}

.bold {
  font-weight: bold;
}

.body {
  position: absolute;
  top: 194px;
  min-height: calc(100vh - 194px);
  width: 100%;
  @media (max-width: 767px) {
    top: 110px;
    min-height: calc(100vh - 110px);
  }

  .tour-body-wrapper {
    .tour-body {
      padding: 50px 30px;

      .tour-container {
        @extend .nav-links;
        padding: 20px 50px;
        background: #303030;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 8px solid $darkBlue;
        &:not(:last-child) {
          margin-bottom: 20px
        }
        div:first-child {
          h1 {
            color: #fff;
            font-family: 'Nixie One';
            text-shadow: 1px 1px $lightBlue
          }
          color: transparentize(#fff, 0.3)
        }
        a {
          font-family: 'Nixie One';
          border: 2px solid #fff;
          padding: 12px;
          white-space: nowrap;
          &:hover {
            border-color: $orange
          }
        }
        @media (max-width: 767px) {
          flex-direction: column;
          padding-bottom: 40px;
          div:first-child {
            margin-bottom: 20px
          }
        }
      }
    }
  }

  .album-wrapper {
    padding: 30px;
    text-align: center;
    h1 {
      font-family: 'Nixie One';
      color: #fff;
      text-shadow: 1px 1px $darkBlue;
      font-size: 2rem;
    }
    h4{
      color: transparentize(#fff, 0.7)
    }
    .album-body {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      .photo {
        margin: 15px
      }
    }
  }

  .bio-wrapper {
    background-attachment: fixed;
    background-size: cover;
    .bio-body {
      padding: 20px;
      .bio {
        background: transparentize(#303030, 0.1);
        padding: 30px;
        color: #fff;
        font-family: 'Nixie One';
        font-size: 1.6em;
        line-height: 1.6;
      }
    }
  }

  .videos-wrapper {
    padding: 20px;
    .video-body {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      .video {
        margin: 20px
      }
    }
  }

  .gallery-wrapper {
    @extend .nav-links;
    padding: 40px 60px;
    display: flex;
    justify-content: center;
    .gallery-body {
      display: grid;
      grid-template-columns: 1fr;
      grid-gap: 30px;

      .gallery {
        background: #303030;
        text-align: center;
        img {
          width: 100%;
        }
      }
    }
  }

  .banner-image-container {
    width: 100%;
    height: 400px;
    background-attachment: scroll;
    background-position: center center;
    background-size: cover;
    display: flex;
    justify-content: center;
    align-items: center;

    .cta {
      user-select: none;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100%;
      @media (max-width: 767px) {
        flex-direction: column;
        justify-content: center;
      }
      a {
        @media (max-width: 767px) {
          margin-right: 0 !important;
          margin-bottom: 35px
        }
        text-align: center;
        font-family: 'Nixie One', sans-serif;
        font-weight: bold;
        text-transform: uppercase;
        font-size: 1.75rem;
        border: 2px solid #fff;
        padding: 16px;
        color: #fff;
        text-decoration: none;
        background: transparentize(#303030, 0.5);
        &:hover {
          background: transparentize(#303030, 0.7);
          color: $orange;
          border-color: $orange
        }
        &:first-child {
          margin-right: 30px
        }
      }
    }
  }

  .content-wrapper {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-gap: 30px;
    padding: 30px 50px;
    @media (max-width: 767px) {
      grid-template-columns: 1fr;
      padding: 0;
      grid-gap: 0;
    }

    .box {
      @extend .nav-links;
      h1 {
        background: $lightBlue;
        margin: 0;
        color: #fff;
        font-family: 'Nixie One';
        padding: 16px;
        text-align: center     
      }
      background: #303030;

      &>div {
        padding: 35px 20px
      }

      .bio {
        color: #fff;
        font-size: 1.2rem;
        line-height: 1.7;
        font-family: 'Nixie One';
        a {
          display: block;
          text-align: right;
          text-decoration: underline
        }
      }

      .tour-date {
        color: #fff;
        font-size: 1.2rem;
        .date {
          margin: 7px 0 12px;
          display: block;
          color: transparentize(#fff, 0.2)
        }
        .ticket-button {
          text-align: right;
          margin-bottom: 20px;
          font-family: 'Nixen One';
        }
        &:not(:last-child) {
          margin-bottom: 30px
        }
        border-bottom: 1px solid transparentize(#fff, 0.2);
      }

    }
  }
}

header {
  @extend .nav-links;
  @extend .contact-form;
  width: 100%;  
  position: fixed;
  z-index: 99;
  border-bottom: 10px solid $darkBlue;
  .mobile-menu {
    @media (min-width: 767px) {
      display: none;
    }
    form {
      margin-top: 20px;
      flex-direction: column;
      input[name="email"] {
        margin-bottom: 20px !important
      }

    }
    position: fixed;
    top: 109px;
    width: 100%;
    background: #303030;
    transition: visibility 0.5s ease, height 0.5s;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    font-size: 2em;
    line-height: 2;
    padding-top: 70px;

    div {
      display: flex;
      justify-content: center;
      margin-top: 20px;
      a {
        &:not(:last-child) {
          margin-right: 20px
        }
      }
    }

    a, div {
      transition: opacity 0.5s;
    }

    &[data-state="closed"] {
      visibility: hidden;
      height: 0;
      a, div {
        opacity: 0
      }
    }
    &[data-state="open"] {
      visibility: visible;
      height: calc(100vh - 109px);
      a, div {
        opacity: 1
      }
    }
  }

  .header-top {
    background: $lightBlue;
    color: #fff;
    padding: 15px 50px;
    line-height: 1.2;
    font-size: 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;

    a {
      &:not(:last-child) {
        margin-right: 12px
      }
    }

    @media (max-width: 800px) {
      padding: 15px 30px
    }

    @media(max-width: 767px) {
      display: none
    }
  }

  .header-bottom {
    background: #303030;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 22px;

    * {
      display: inline-block;
    }

    div {
      user-select: none
    }

    nav {
      flex: 1;
      text-align: center;
      font-size: 1.5rem;
      line-height: 2;

      @media (max-width: 768px) {
        text-align: right
      }

      a {
        &:not(:last-child) {
          margin-right: 16px;
          @media (max-width: 768px) {
            display: none
          }
          @media (width: 768px) {
            display: inline-block
          }
        }
      }
    }
  }

  #dropdown-toggle {
    font-size: 2rem;
    margin-right: 40px;
    @media (min-width: 768px) {
      display: none
    }
  }
}

footer {
  @extend .contact-form;
  @extend .nav-links;
  background: $darkBlue;
  color: #fff;
  padding: 50px;
  text-align: center;
  div {
    margin-bottom: 30px
  }
  a {
    font-size: 1.5rem;
    &:not(:last-child) {
      margin-right: 15px
    }
  }
  form {
    @media (max-width: 767px) {
      flex-direction: column;
      input[name="email"] {
        margin-bottom: 20px !important
      }
    } 
  }
}

.nav-links {
  a, #dropdown-toggle {
    color: #fff;
    text-decoration: none;
    cursor: pointer;
    &:hover {
      color: $orange;
    }
    &:active {
      color: $orange;
    }
    &:focus {
      color: $orange;
    }
  }
}

.contact-form {
  form {
    display: inline-flex;
    align-items: center;
    font-size: 1.5rem;
    * {
      display: inline-block
    }
    input[name="email"] {
      height: 2rem;
      padding: 4px 10px;
      border: 0;
      outline: 0;
      margin: 0 5px 0 0;
      text-transform: lowercase;
    }
    input[type="submit"] {
      cursor: pointer;
      padding: 6px 12px;
      border: 2px solid white;
      line-height: 1.2;
      font-size: calc(1.5rem - 2px);
      background: none;
      color: white;
      text-transform: uppercase;
      &:hover {
        background: $orange
      }
    }
  }
}
```

###The Main Layout

The last step before we get building is to make a few tweaks to the main Handlebars layout, in which we need to link to Font Awesome, Normalize.css, and change the title. Post-changes, ```main.handlebars``` will look like this:

```handlebars
{{!-- views/layouts/main.handlebars --}}

<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width">
  <title>{{title}}</title> {{!-- title, passed in req.locals --}}
  <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" /> {{!-- Font Awesome --}}
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/normalize/7.0.0/normalize.css" /> {{!-- Normalize.css --}}
  <link rel="stylesheet" href="/css/style.css">
  {{#if ENV_DEVELOPMENT}}
    <script src="http://localhost:35729/livereload.js"></script>
  {{/if}}
</head>
<body>


  {{{body}}}

  <script src="/js/main.js"></script>
  </body>
</html>
```

## Part 4. Build the Header and Footer

Every page on the site will have a header, so we'll build that first. For the same reason, we'll make it a partial. It will feature links to our social media, a signup form for our mailing list, our logo, and the main navigation. 

Add this to ```partials/header.handlebars```:

```handlebars
{{!-- views/partials/header.handlebars --}}

<header>
    <div class="mobile-menu" data-state="closed">
        {{> nav-links}}
        {{> signup-form}}
        <div>
            {{> social-links}}
        </div>
    </div>
    <div class="header-top">
        <div>
            {{> social-links}}
        </div>
        {{> signup-form}}
    </div>
    <div class="header-bottom">
        <div class="banner">
            <a href="/">
                {{#if settings.logo}}
                    <img height="90" src="{{settings.logo.url}}" /> 
                {{else}}
                    <h1>{{settings.bandName}}</h1>
                {{/if}}
            </a>
        </div>
        <nav>
            {{> nav-links}}
            <i data-state="closed" class="fa fa-bars" id="dropdown-toggle"></i>
        </nav>
    </div>
</header>
```

This gives us a responsive header with a mobile dropdown menu where we need to build out ```nav-links```, ```signup-form```, and ```social-links``` as their own partials. Again, ```settings.logo``` (and other data) will be passed from the route through ```req.locals```.

### Nav Links Partial

For the sake of not repeating ourselves, we create a partial with all of our navigation links in ```partials/nav-links.handlebars```.

```handlebars
{{!-- views/partials/nav-links.handlebars --}}

<a href="/tour">Tour</a>
<a href="/photo-gallery">Photos</a>
<a href="/videos">Videos</a>
<a href="{{settings.music_link}}">Music</a>
```

### Social Links Partial

The same goes for our social media links, except the way we pass the data will make the construction slighly more interesting. Because the link element is the same for each account, save for the `title`, text, and `href`, we'll use the Handlebars `each` helper to iterate over all of our accounts.

```handlebars
{{!-- views/partials/social-links.handlebars --}}

{{#each socials}}
    <a class="social-link" href="{{this}}" target="_blank">
        <i class="fa fa-{{@key}}" title="{{@key}}"></i>
    </a> 
{{/each}}
```

### Signup Form Partial

Finally, we need a form to handle adding new subscribers to our Mailchimp list. We'll simply gather their email address and process it later in a POST request to ```/signup```.

```handlebars
{{!-- views/partials/signup-form.handlebars --}}

<form method="post" action="signup">
    <input name="email" tabindex="-1" type="email" placeholder="Join the mailing list" required />
    <input type="submit" value="Sign Up" />
</form>
```

With all of the Header partials complete, the header itself is complete, and we essentially get the Footer for free:

```handlebars
{{!-- views/partials/footer.handlebars --}}

<footer>
    <div>
        <i class="fa fa-copyright"></i>
        {{#getYear}}{{/getYear}} {{settings.band_name}}
    </div>
    <div>
		{{> social-links}}
    </div>
    {{> signup-form}}
</footer>
```

Notice the `#getYear` helper. We'll define this later in `app.js` and us it to return the current year as a string.

## Part 5. Build the Home Page

The home page will be a glimpse into what's on the rest of the site. In the top half we'll show our header and a big CTA section with buttons linking to our Tour Dates and photo gallery. In the bottom half we'll show three upcoming shows, a blurb of our bio, and a footer.

```handlebars
{{!-- views/index.handlebars --}}

{{> header}}
<div class="body">
    <div class="banner-image-container" style="background-image: url({{homepage.banner_image.url}})">
        <section class="cta">
            <a href="/tour">Tour Dates</a>
            <a href="/photo-gallery">Gallery</a>
        </section>
    </div>
    <div class="content-wrapper">
        <div class="box tour-dates">
            <h1>Upcoming Shows</h1>
            <div>
                {{#each tourDates}}
                    <div class="tour-date">
                        <span>
                            <span class="bold">
                                {{this.title}} -
                            </span>
                         {{this.metadata.location}}
                        </span>
                        <span class="date">
                         {{formatDate this.metadata.date}}
                        </span>
                        <div class="ticket-button">
                            <a href="{{this.metadata.ticket_link}}">Get Tickets <i class="fa fa-long-arrow-right"></i></a>
                        </div>
                    </div>
                {{/each}}
            </div>
        </div>
        <div class="box">
            <h1>Bio</h1>
            <div class="bio">
                {{truncateText settings.bio 70}}
                <a href="/bio">Read More</a>
            </div>
        </div>
    </div>
    {{> footer}}
</div>
```

Later, we'll define the `formateDate` and `truncateText` helpers to display a nicer date format than we've stored in Cosmic and to shorten our bio, respectively.

### Home Page Settings

The home page will have a banner image that gets displayed on it uniquely in the CTA section, so we'll create a ```Settings``` object called `Homepage` with the metafield `Banner Image`, and upload a banner of our choice.

## Part 6. Build the Remaining Views

### Tour Dates

For the Tour Dates page, we'll simply iterate over the Tour Date objects we pass it and display them in a stylized container:

```handlebars
{{!-- views/tour.handlebars --}}

{{> header}}
<div class="body">
    <div class="tour-body-wrapper">
        <div class="tour-body">
            {{#each tourDates}}
                <div class="tour-container">
                    <div>
                        <h1>{{this.title}}</h1>
                        <h4>{{this.metadata.location}} - {{formatDate this.metadata.date}}</h4>
                    </div>
                    <div>
                        <a href="{{this.metadata.ticket_link}}">Get Tickets</a>
                    </div>
                </div>
            {{/each}}
        </div>
    </div>
    {{> footer}}
</div>
```

### Videos

Similar to the Tour Dates, we simply use the embed codes we store for our Youtube videos in Cosmic by wrapping the reference in triple-brackets to escape html, i.e. `{{{embed-code}}}`.

```handlebars
{{!-- views/videos.handlebars --}}

{{> header}}
<div class="body">
    <div class="videos-wrapper">
        <div class="video-body">
            {{#each videos}}
                <div class="video">
                    {{{this.metadata.embed_code}}}
                </div>
            {{/each}}
        </div>
    </div>
    {{> footer}}
</div>
```

### Bio

The last of the simple views is the Bio, which literally just stylizes the biography we've stored in Cosmic and puts a header image of our choice behind it.

```handlebars
{{!-- views/bio.handlebars --}}

{{> header}}
<div class="body">
    <div class="bio-wrapper" style="background-image: url('{{settings.bio_header.url}}')">
        <div class="bio-body">
            <div class="bio">
             {{settings.bio}}
            </div>
        </div>
    </div>
    {{> footer}}
</div>
```

### Gallery

Marginally more complicated, but similar to the Tour Dates view is the Gallery view, which will show all of the photo albums we've stored on Cosmic. It iterates over the albums, linking to each's slug as a subdirectory of `photo-gallery/`.

```handlebars
{{!-- views/gallery.handlebars --}}

{{> header}}
<div class="body">
    <div class="gallery-wrapper">
        <div class="gallery-body">
            {{#each galleries}}
                <div class="gallery">
                    <a href="/photo-gallery/{{this.slug}}">
                        <img src="{{this.metadata.cover_photo.url}}" />
                        <h4>{{this.title}}</h4>
                    </a>
                </div>
            {{/each}}
        </div>
    </div>
    {{> footer}}
</div>
```

### Album

Finally, is the album view which displays photos from indivudual albums/galleries.

```handlebars
{{!-- views/album.handlebars --}}

{{> header}}
<div class="body">
    <div class="album-wrapper">
        <h1>{{album.title}}</h1>
        <h4>{{formatDate album.metadata.date}}</h4>
        <div class="album-body">
            {{#each photos}}
                <div class="photo">
                    <a href="{{this.photo.url}}"><img height="200" src="{{this.photo.url}}" /></a>
                </div>
            {{/each}}
        </div>
    </div>
    {{> footer}}
</div>
```

## Part 7. Define Custom Handlebars Helpers

You've noticed throughout our views that we've used three custom helpers — `truncateText`, `getYear`, and `formatDate` — to help us with display logic problems. Handlebars lets us define these when we're setting our App's view engine. We'll leverage `moment` and `truncate-html` within them.

```javascript
// app.js

// etc...
app.engine('handlebars', exphbs({
    defaultLayout: 'main',
    partialsDir: ['views/partials/'],
    helpers: {
        truncateText(text, length) {
            return truncate(text, length, { stripTags: true, byWords: true })
        },
        getYear() {
            return moment().format('YYYY')
        },
        formatDate(date) {
            return moment(date).format('MMMM Do[,] YYYY')
        } 
    }
}));
```

 ## Part 8. Build the Routes

We'll keep all of our routes within `routes/index.js` for simplicity. First, import `cosmicjs`, `axios`, `async`, and `lodash`, to cover our Ajax needs.

```javascript
// routes/index.js

const Cosmic = require('cosmicjs')
const async = require('async')
const _ = require('lodash')
const axios = require('axios')
```

### Index Route

Since we're showing Tour Dates and need to pull from both our Site Settings and Homepage Settings, we need to make three requests with the Cosmic client. We'll do them in series usinc `async.series` and store the fetched data in `res.locals` to send to the `index` view. To only show the 3 most recent tour dates, will use `_.sortBy` to sort according to `metadata.date` in our Cosmic object, and slice off the rest.

```javascript
// routes/index.js

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
```

### Tour Route

The Tour route is similiar to the index except that we don't need the hompage settings and aren't modifying the tour date data.

```javascript
// routes/index.js

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
```

### Photo Gallery Route

Following the same pattern:

```javscript
// routes/index.js

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
```

### Album Route

The album route is different in that we display each individual album as a subdirectory of `photo-gallery`, passing the album's slug in Cosmic as a url parameter. When we fetch the album object with `Cosmic.getObject`, the object slug we have to pass is then `req.params.slug`. 

```javascript
// routes/index.js

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
```

### Videos Route

The videos route is essentially equivalent to the photo gallery route:

```javascript
// routes/index.js

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
```

### Bio Route

The bio route is equally uninteresting:

```javascript
// routes/index.js

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
```

### Signup

The signup route is the most interesting because here we accept a post request containing the subscribers email address and use the Mailchimp API to add the subscriber to our list. Cosmic gives us the option to add custom ENV variables when we deploy, so we'll leverage this to store our Mailchimp API key (as `MAILCHIMP_KEY`), Mailchimp Data Center (as `MAILCHIMP_DC`). and Mailchimp List ID (as `MAILCHIMP_LIST_ID`). We can then access these via `process.env`.

Using these, we construct a post request with `axios` that points to the Mailchimp api, add our subscriber, and redirect to the homepage.

```javascript
// routes/index.js

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
```

## Part 9. Deploy

Before deploying — which is just pushing to a Github repo and following the instructions on the Cosmic dashboard — make sure you compile the Sass styles with `gulp sass`

## Part 10. Conclusion

Using CosmicJS, Express, and Mailchimp, we've built an accessible, functional website for our band that lets us update information, tour dates, photo galleries, and videos on the fly, all without having to redploy the site with every change. Cosmic's API first approch let us do this simply, without a database, and with a great dashboard to manage our data whenever, wherever.

With how quickly we've been able to build our app and with the simplicity of deploying and maintaining it, it's clear that CosmicJS is one of a kind in its API first approach to content management. Clearly, CosmisJS is a money maker.

------

*Matt Cain builds smart web applications and writes about the tech used to build them. You can learn more about him on his [portfolio](http://mattcain.io)*.