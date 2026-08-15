class ApiResponse {
    constructor(status, message, data = null) {
        this.status = status;
        this.message = message;
        this.data = data;
        this.success = status >= 200 && status < 300; // success if status code is in the 2xx range
    }
}

module.exports = ApiResponse;