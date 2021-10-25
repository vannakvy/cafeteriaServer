import { gql } from 'apollo-server'

const global = gql`

    type Geolocation {
        lat: Float
        long: Float
    }

    type Status {
        isPrepared: Boolean
        isCooked: Boolean
        isDelivered: Boolean
        isPaid: Boolean
    }

    input InputRangeDate {
        startDate: String!
        endDate: String!
    }

    input InputGeolocation{
        lat: Float
        long: Float
    }

    input InputStatus{
        isPrepared: Boolean
        isCooked: Boolean
        isDelivered: Boolean
        isPaid: Boolean
    }
    
`;

export default global