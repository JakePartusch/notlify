import { FunctionCode, Function, IFunction } from "aws-cdk-lib/aws-cloudfront";
import { Construct } from "constructs";

interface ComplianceProps {}

export class Compliance extends Construct {
  public complianceCloudfrontFunction: IFunction;
  constructor(scope: Construct, id: string, props?: ComplianceProps) {
    super(scope, id);

    const complianceFunction = new Function(
      scope,
      "ComplianceCloudFrontFunction",
      {
        code: FunctionCode.fromInline(`
        function handler(event) {

            var policies = {"items": [{"country_cd": "us", "country_region_cd": "ne", "country_region_city": "omaha"}]};
            
            var request = event.request;
            var headers = request.headers;
            if (!headers['cloudfront-viewer-city']) {
                // "cloudfront-viewer-city" header is missing, skip the validation.'
                return request;
            }
            var requestCountry = headers['cloudfront-viewer-country'].value;
            var requestRegion = headers['cloudfront-viewer-country-region'].value;
            var requestCity = headers['cloudfront-viewer-city'].value;    
                var matched = policies.items.some(function(e) {
                return this[0].toLowerCase() == e.country_cd.toLowerCase() 
                && this[1].toLowerCase() == e.country_region_cd.toLowerCase()
                && this[2].toLowerCase() == e.country_region_city.toLowerCase()
                }, [requestCountry, requestRegion, requestCity]
            );
            
            if (matched) {
                var response = {
                    statusCode: 403,
                    statusDescription: 'Forbidden',
                }
                return response;
            }
            return request;
        }
         }`),
      }
    );
    this.complianceCloudfrontFunction = complianceFunction;
  }
}
