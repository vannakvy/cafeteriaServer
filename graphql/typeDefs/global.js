import { gql } from 'apollo-server'

const global = gql`

    type Geolocation {
        lat: Float
        long: Float
        placename: String
    }

    type Status {
        id: String
        isPrepared: Boolean
        isCooked: Boolean
        isDelivered: Boolean
        deliveryTime: String
        isPaid: Boolean
        isCanceled: Boolean
    }

    type Rate {
        rate: Int,
        comment: String,
    }

    type Pagination{
        current: Int
        count: Int
    }

    type Notification{
        id: String,
        action: String,
        title: String,
        content: String,
        user: String,
        createAt: String,
    }

    input InputRangeDate {
        startDate: String!
        endDate: String!
    }

    input InputGeolocation{
        lat: Float
        long: Float
        placename: String
    }

    input InputStatusWithId{
        id: String
        isPrepared: Boolean
        isCooked: Boolean
        isDelivered: Boolean
        deliveryTime: String
        isPaid: Boolean
        isCanceled: Boolean
    }

    input InputStatus{
        isPrepared: Boolean
        isCooked: Boolean
        isDelivered: Boolean
        deliveryTime: String
        isPaid: Boolean
        isCanceled: Boolean
    }

    input InputRate{
        rate: Int
        comment: String
    }

    input InputId{
        id: String!
    }

    input InputPagination{
        id: String
        current: Int
        limit: Int
        keyword: String
    }
    
    type Subscription{
        newNotice: Notification!
        updateStatus(input: InputId): Status!
    }
`;

export default global