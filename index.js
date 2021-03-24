const AWS = require('aws-sdk')

const ssmParams = {
    Names: ['/fileshare/AccessKey', '/fileshare/SecretAccessKey', '/fileshare/BitlyToken'],
    WithDecryption: true
}

exports.handler = async (event) => {
    console.log('object key is :', event.Records[0].s3.object.key)
    
    const ssm = new AWS.SSM()
    const secret = await ssm.getParameters(ssmParams).promise()
    const accessKeyId = secret.Parameters.filter(params => params.Name === '/fileshare/AccessKey')[0].Value
    const secretAccessKey = secret.Parameters.filter(params => params.Name === '/fileshare/SecretAccessKey')[0].Value
    const bitlyToken = secret.Parameters.filter(params => params.Name === '/fileshare/BitlyToken')[0].Value
    
    AWS.config.update({
        'accessKeyId': accessKeyId,
        'secretAccessKey': secretAccessKey,
        'region': 'ap-northeast-1'
    })
    
    const s3 = new AWS.S3()
    const expireDays = 3 * 60 * 60 * 24  // 期限は3日間有効
    const params = {Bucket: 'mugajin-fileshare', Key: event.Records[0].s3.object.key, Expires: expireDays}
    
    const downloadUrl = s3.getSignedUrl('getObject', params)
    console.log('The url is ', downloadUrl)
    
    return "download url is  " + downloadUrl + " "
};
