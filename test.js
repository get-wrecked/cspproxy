const fs = require('fs');

const Cloudworker = require('@dollarshaveclub/cloudworker');
const assert = require('assert');
const nock = require('nock');


describe('CSSProxy test', function() {
    let context;

    before(async function () {
        const source = fs.readFileSync('index.js', 'utf8');
        context = new Cloudworker(source).context;
        global.handleRequest = context.handleRequest;
        global.Request = context.Request;
    });

    it('modifies the csp header', async function () {
        context.REPLACEMENTS = '{"*.otherexample.com": "example.com"}';
        nock('https://example.com')
            .get('/')
            .reply(200, 'Mocked response', {
                'Content-Security-Policy': "default-src https: 'self' *.otherexample.com; font-src 'self' *.otherexample.com",
            });

        const request = new Request(new URL('https://example.com'));
        const response = await handleRequest(request);
        assert.equal(await response.text(), "Mocked response");
        assert.equal(response.headers.get('Content-Security-Policy'), "default-src https: 'self' example.com; font-src 'self' example.com");
    });
});
