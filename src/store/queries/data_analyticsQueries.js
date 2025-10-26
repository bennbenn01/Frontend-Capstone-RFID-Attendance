import api from '../../utils/axios'

export const dataAnalyticsSearchResults = async({ queryKey }) => {
    const [_key, { query, fields }] = queryKey;
    const response = await api.post(import.meta.env.VITE_APP_SEARCH_QUERY, {
        query,
        fields,
        data_analytics: true
    });
    return response.data;
}