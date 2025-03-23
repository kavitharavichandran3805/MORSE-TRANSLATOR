const apiCall = async (endpoint, method, body = null) => {
    try {
        const url = `http://127.0.0.1:8000/api/${endpoint}/`;
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            credentials: "include"
        };

        if (body !== null) {
            console.log("Request Body:", body);
            options.body = JSON.stringify(body)

        }
        const response = await fetch(url, options)
        if (response.ok) {
            const result = await response.json();
            console.log("Result : " + JSON.stringify(result, null, 2))
            return result
        }
        else {
            return { status: false, error: `Error: ${response.statusText}` };
        }
    } catch (error) {
        console.error('Error:', error);
        // alert('An error occurred. Please try again.');
        return { status: false, error: error.message };
    }
}