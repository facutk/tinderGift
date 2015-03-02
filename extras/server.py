from flask import Flask, request, redirect, url_for, send_from_directory
from werkzeug.utils import secure_filename
import requests
from mercadolibre import get_ml_data

from flask import jsonify
from functools import wraps
from flask import redirect, request, current_app
    
app = Flask(__name__, static_url_path='')

def support_jsonp(f):
    """Wraps JSONified output for JSONP"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        callback = request.args.get('callback', False)
        if callback:
            content = str(callback) + '(' + str(f(*args,**kwargs).data) + ')'
            return current_app.response_class(content, mimetype='application/json')
        else:
            return f(*args, **kwargs)
    return decorated_function

@app.after_request
def add_cors(resp):
    """ Ensure all responses have the CORS headers. This ensures any failures are also accessible
        by the client. """
    resp.headers['Access-Control-Allow-Origin'] = request.headers.get('Origin','*')
    resp.headers['Access-Control-Allow-Credentials'] = 'true'
    resp.headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS, GET, PUT, DELETE'
    resp.headers['Access-Control-Allow-Headers'] = request.headers.get( 'Access-Control-Request-Headers', 'Authorization' )
    # set low for debugging
    if app.debug:
        resp.headers['Access-Control-Max-Age'] = '1'
    return resp

@app.route('/ml/<path:url>', methods=['GET','POST'])
@support_jsonp
def ml( url ):
    return jsonify( get_ml_data( url ) )
    
if __name__ == '__main__':
    app.debug = True
    app.run()