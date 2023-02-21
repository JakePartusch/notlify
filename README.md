<p align="center">
    <img alt="Notlify" src="./src/control-plane/ui/app/src/images/icon.png" width="100" />
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

### What is Notlify?

Notlify is an example of building a PaaS with AWS technologies, including S3, CloudFront, and the CDK. Notlify is not intended to be a production hosting service, but rather an example of a platform built entirely with TypeScript, Serverless AWS resources, and with independent deployment isolation. 


### Notlify Features

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

- **Administrative UI** Notlify ships a Control Plane UI at https://notlify.dev. Login with a GitHub account, connect a public repo, and add the GitHub action to try it out.
<p align="center">
    <img alt="Notlify" src="./docs/images/notlify-ui.png" width="1000" />
</p>

- **Serverless GraphQL Admin API** The Notlify UI is backed by an Apollo GraphQL server in a Lambda function, using DynamoDB as a data store.
- **Website Deployments via GitHub Actions** Notlify executes individual website deployments to a separate AWS Account, using a distinct stage in the user's chosen region. 

### Example Websites Deployed with Notlify
- [Eleventy](https://github.com/JakePartusch/eleventy-example)
- [Create React App](https://github.com/JakePartusch/cra-example)
- [Vue](https://github.com/JakePartusch/vue-example)
- [Notlify.dev](https://github.com/JakePartusch/notlify/tree/main/src/control-plane/ui/app)
