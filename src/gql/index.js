import gql from "graphql-tag"

export const ValidatorProfile = gql`
  query KeybaseInfo($keybaseId: String) {
    keybase: validatorList(where: { keybaseId: { _eq: $keybaseId } }) {
      keybaseId
      lastUpdated
      profileUrl
      userName
      customized
      avatarUrl
    }
  }
`
