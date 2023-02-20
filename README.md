<p align="center">
    <img alt="Notlify" src="./src/control-plane/ui/app/public/notlify-logo-square.png" width="100" />
</p>
<h1 align="center">
  Notlify
</h1>

<h3 align="center">
  💻 🚀 ☁ 
</h3>
<h3 align="center">
  A Netlify-like PaaS on AWS
</h3>
<p align="center">
  Notlify is a Platform as a Service example that mimics the functionality of Netlify, using AWS Serverless techonologies
</p>

> Not currently intended for production use

### What is Notlify?

This is primarily an example of building a Platform as a Service with AWS technologies.

- **Static Websites** Websites with static assets are all supported. They are continuously deployed on commit to an S3 bucket with a CloudFront distribution.
- **Custom GitHub Action** Notlify applications are simply deployed with a custom GitHub Action

```yaml
- name: Deploy UI
  uses: JakePartusch/notlify-action@main
  with:
    applicationName: vue-example
    distributionDirectory: dist
    apiKey: ${{ secrets.NOTLIFY_API_KEY }}
```

- **Administrative UI** Notlify ships a Control Plane UI at https://notlify.dev.
<p align="center">
    <img alt="Notlify" src="./docs/images/notlify-ui.png" width="600" />
</p>
