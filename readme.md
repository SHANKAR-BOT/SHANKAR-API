# Setup
Edit the information in the config.json

# Add API

```javascript
exports.config = {
    name: 'example',
    author: 'Your_Name',
    description: 'API Description',
    category: 'utility',
    link: ['/example?q=test'] 
};

exports.initialize = async function ({ req, res }) {
    // your api code here
};

```

# Note
You don't need to add the API link in the html because it will be automatically show in website