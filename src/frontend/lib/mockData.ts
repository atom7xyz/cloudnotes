import { faker } from '@faker-js/faker';

// Document types
export interface MockDocument {
  id: string;
  name: string;
  uploadDate: Date;
  rating: number;
  commentCount: number;
  uploaderUsername: string;
  uploaderAvatar: string;
  thumbnailUrl: string;
  fileType: 'pdf' | 'word' | 'powerpoint' | 'txt' | 'epub';
  fileSize: string;
  viewCount: number;
  downloadCount: number;
  tags: string[];
  isPublic: boolean;
}

// User types
export interface MockUser {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  avatar: string;
  reviewsReceived: number;
  reviewsGiven: number;
  friendsInvited: number;
  savedDocumentsCount: number;
  savedDocuments: string[];
  uploadedDocuments: string[];
  publicDocumentsCount: number;
  totalDocumentsCount: number;
  joinDate: Date;
  bio: string;
}

class MockDataGenerator {
  private documents: MockDocument[] = [];
  private users: MockUser[] = [];
  
  constructor(documentCount = 12, userCount = 8) {
    this.generateUsers(userCount);
    this.generateDocuments(documentCount);
    this.updateUserDocumentCounts();
  }
  
  private generateUsers(count: number): void {
    this.users = Array.from({ length: count }, () => {
      const firstName = faker.person.firstName('male');
      const lastName = faker.person.lastName('male');
      const username = faker.internet.userName({ firstName, lastName }).toLowerCase();
      
      return {
        id: faker.string.uuid(),
        firstName,
        lastName,
        username,
        avatar: faker.image.avatarGitHub(),
        reviewsReceived: faker.number.int({ min: 0, max: 100 }),
        reviewsGiven: faker.number.int({ min: 0, max: 50 }),
        friendsInvited: faker.number.int({ min: 0, max: 30 }),
        savedDocumentsCount: faker.number.int({ min: 0, max: 40 }),
        savedDocuments: Array.from({ length: faker.number.int({ min: 0, max: 15 }) }, () => faker.string.uuid()),
        uploadedDocuments: [],
        publicDocumentsCount: 0,
        totalDocumentsCount: 0,
        joinDate: faker.date.past({ years: 3 }),
        bio: faker.lorem.sentence(10)
      };
    });
  }
  
  private generateDocuments(count: number): void {
    const fileTypes: ('pdf' | 'word' | 'powerpoint' | 'txt' | 'epub')[] = [
      'pdf', 'word', 'powerpoint', 'txt', 'epub'
    ];
    
    this.documents = Array.from({ length: count }, () => {
      const randomUserIndex = faker.number.int({ min: 0, max: this.users.length - 1 });
      const user = this.users[randomUserIndex];
      const fileType = fileTypes[faker.number.int({ min: 0, max: fileTypes.length - 1 })];
      const fileSizeKB = faker.number.int({ min: 100, max: 10000 });
      const fileSizeMB = (fileSizeKB / 1024).toFixed(2);
      const docId = faker.string.uuid();
      const isPublic = Math.random() > 0.3; // 70% chance of being public
      
      // Add document to user's uploaded documents
      if (user.uploadedDocuments) {
        user.uploadedDocuments.push(docId);
      }
      
      return {
        id: docId,
        name: faker.system.fileName({ extensionCount: 0 }) + ' ' + faker.lorem.words(2),
        uploadDate: faker.date.recent({ days: 100 }),
        rating: faker.number.float({ min: 1, max: 5, fractionDigits: 1 }),
        commentCount: faker.number.int({ min: 0, max: 50 }),
        uploaderUsername: user.username,
        uploaderAvatar: user.avatar,
        thumbnailUrl: faker.image.urlLoremFlickr({ category: 'abstract' }),
        fileType,
        fileSize: fileSizeKB > 1000 ? `${fileSizeMB} MB` : `${fileSizeKB} KB`,
        viewCount: faker.number.int({ min: 10, max: 5000 }),
        downloadCount: faker.number.int({ min: 0, max: 1000 }),
        tags: Array.from({ length: faker.number.int({ min: 1, max: 5 }) }, () => faker.lorem.word()),
        isPublic
      };
    });
  }
  
  private updateUserDocumentCounts(): void {
    // Calculate document counts for each user
    this.users.forEach(user => {
      const userDocuments = this.documents.filter(doc => doc.uploaderUsername === user.username);
      const publicDocuments = userDocuments.filter(doc => doc.isPublic);
      
      user.totalDocumentsCount = userDocuments.length;
      user.publicDocumentsCount = publicDocuments.length;
    });
  }
  
  public getDocuments(): MockDocument[] {
    return this.documents;
  }
  
  public getUsers(): MockUser[] {
    return this.users;
  }
  
  public searchDocuments(query: string): Promise<MockDocument[]> {
    // Simulate network delay
    return new Promise((resolve) => {
      setTimeout(() => {
        if (!query || query.trim() === '') {
          // If no query is provided, return all documents
          resolve(this.documents);
          return;
        }
        
        const lowerCaseQuery = query.toLowerCase();
        const results = this.documents.filter((doc) => {
          return (
            doc.name.toLowerCase().includes(lowerCaseQuery) ||
            doc.uploaderUsername.toLowerCase().includes(lowerCaseQuery) ||
            doc.tags.some(tag => tag.toLowerCase().includes(lowerCaseQuery))
          );
        });
        
        resolve(results);
      }, 500); // 500ms delay to simulate loading
    });
  }
  
  public searchUsers(query: string): Promise<MockUser[]> {
    // Simulate network delay
    return new Promise((resolve) => {
      setTimeout(() => {
        if (!query || query.trim() === '') {
          resolve([]);
          return;
        }
        
        const lowerCaseQuery = query.toLowerCase();
        const results = this.users.filter((user) => {
          return (
            user.firstName.toLowerCase().includes(lowerCaseQuery) ||
            user.lastName.toLowerCase().includes(lowerCaseQuery) ||
            user.username.toLowerCase().includes(lowerCaseQuery) ||
            user.bio.toLowerCase().includes(lowerCaseQuery)
          );
        });
        
        resolve(results);
      }, 500); // 500ms delay to simulate loading
    });
  }
  
  public getRecentSearches(): string[] {
    return [
      "@science robots in space",
      "cloud computing",
      "@pdf @research quantum physics",
      "machine learning",
      "neural networks"
    ];
  }
}

// Create a singleton instance for the app to use
export const mockDataService = new MockDataGenerator(); 