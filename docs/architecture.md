Here's the db layout:

```mermaid
erDiagram
    User ||--o{ LoginSession : has
    User ||--o{ DiscordAccount : "logs in with"
    User {
        string ID PK
        string Name
        string HighestRole
        timestamp DiscordLastUpdatedAt
        string Avatar-FileID
    }
    LoginSession {
        string UserID-FK PK
        guid RandomSessionID PK
        timestamp Expires
    }
    DiscordAccount {
        string DiscordID PK
        string UserID
        guid RegistrationHash
        timestamp RegistrationTimesOutAt
    }
    User ||--o{ Character : "creator of"
    Character {
        string ID PK
        string Name
        string CreatorName
        string CreatorID-FK
        string Bio
        string Rating
        bool Claimable
    }
    User ||--o{ File : uploads
    File {
        string ID PK
        string Uploader-FK
        string URL
        string Filename
    }
    File ||--|| Art : is
    Art }o--o{ Character : "includes"
    User }o--o{ Art : "is artist of"
    Art {
        string FileID-FK PK
        string Description
        string Rating
    }
```