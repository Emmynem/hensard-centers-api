import axios from 'axios';
import { clouder_url } from '../config/config';

export const deleteImage = async function (key, payload) {
    try {
        const response = await axios.delete(
            `${clouder_url}/remove/file`,
            {
                data: {
                    key,
                    ...payload
                }
            },
        );
        return { err: false, data: response.data };
    } catch (error) {
        return { err: true, error, response_code: error.response.status };
    }
};

