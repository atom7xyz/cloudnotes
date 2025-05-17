import { faker } from '@faker-js/faker';

// Set a fixed seed for reproducible data
faker.seed(123);

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

// New document type for homepage
export interface HomeDocument {
  id: string;
  title: string;
  description: string;
  category: string;
  uploaderUsername: string;
  uploaderAvatar: string;
  uploadDate: Date;
  rating: number;
  commentCount: number;
  tags: string[];
  fileType: 'pdf' | 'word' | 'powerpoint' | 'txt' | 'epub';
  fileSize: string;
  viewCount: number;
  downloadCount: number;
  isFavorite: boolean;
  thumbnail: string;
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

// Custom users with scholarly backgrounds
const scholarUsers: MockUser[] = [
  {
    id: 'user1',
    firstName: 'Marcus',
    lastName: 'Henderson',
    username: 'classicist',
    avatar: 'https://i.pravatar.cc/150?u=classicist',
    reviewsReceived: 132,
    reviewsGiven: 87,
    friendsInvited: 29,
    savedDocumentsCount: 64,
    savedDocuments: ['103', '107', '110'],
    uploadedDocuments: ['101', '105'],
    publicDocumentsCount: 17,
    totalDocumentsCount: 22,
    joinDate: new Date('2021-03-12'),
    bio: 'Classical literature professor specializing in Greek and Roman epic poetry. Publications in the Journal of Hellenic Studies and Classical Quarterly.'
  },
  {
    id: 'user2',
    firstName: 'Sophia',
    lastName: 'Chen',
    username: 'stoicmind',
    avatar: 'https://i.pravatar.cc/150?u=stoicmind',
    reviewsReceived: 94,
    reviewsGiven: 116,
    friendsInvited: 15,
    savedDocumentsCount: 58,
    savedDocuments: ['102', '108', '112'],
    uploadedDocuments: ['102', '107'],
    publicDocumentsCount: 14,
    totalDocumentsCount: 19,
    joinDate: new Date('2021-05-24'),
    bio: 'Philosophy researcher with focus on Stoicism and its applications in modern cognitive behavioral therapy. Author of "Stoic Wisdom for Modern Minds".'
  },
  {
    id: 'user3',
    firstName: 'Amir',
    lastName: 'Patel',
    username: 'academydebates',
    avatar: 'https://i.pravatar.cc/150?u=academydebates',
    reviewsReceived: 78,
    reviewsGiven: 92,
    friendsInvited: 23,
    savedDocumentsCount: 47,
    savedDocuments: ['101', '104', '109'],
    uploadedDocuments: ['103', '111'],
    publicDocumentsCount: 11,
    totalDocumentsCount: 15,
    joinDate: new Date('2021-04-18'),
    bio: 'Political philosophy researcher at Oxford. My work examines the continuing relevance of ancient political thought in contemporary governance.'
  },
  {
    id: 'user4',
    firstName: 'Elizabeth',
    lastName: 'Cohen',
    username: 'scriptscholar',
    avatar: 'https://i.pravatar.cc/150?u=scriptscholar',
    reviewsReceived: 116,
    reviewsGiven: 84,
    friendsInvited: 31,
    savedDocumentsCount: 72,
    savedDocuments: ['101', '102', '103', '106'],
    uploadedDocuments: ['104'],
    publicDocumentsCount: 19,
    totalDocumentsCount: 26,
    joinDate: new Date('2020-11-09'),
    bio: 'Biblical studies scholar with expertise in historical-critical method and ancient Near Eastern languages. Currently researching intertextuality in wisdom literature.'
  },
  {
    id: 'user5',
    firstName: 'Jason',
    lastName: 'Edwards',
    username: 'mythosreader',
    avatar: 'https://i.pravatar.cc/150?u=mythosreader',
    reviewsReceived: 88,
    reviewsGiven: 103,
    friendsInvited: 19,
    savedDocumentsCount: 51,
    savedDocuments: ['105', '109', '111'],
    uploadedDocuments: ['108', '112'],
    publicDocumentsCount: 13,
    totalDocumentsCount: 17,
    joinDate: new Date('2021-01-27'),
    bio: 'Comparative mythology researcher and teacher. My work explores hero archetypes across different cultural traditions and their psychological significance.'
  },
  {
    id: 'user6',
    firstName: 'Priya',
    lastName: 'Sharma',
    username: 'dharmapath',
    avatar: 'https://i.pravatar.cc/150?u=dharmapath',
    reviewsReceived: 102,
    reviewsGiven: 79,
    friendsInvited: 27,
    savedDocumentsCount: 63,
    savedDocuments: ['104', '106', '111'],
    uploadedDocuments: ['106'],
    publicDocumentsCount: 16,
    totalDocumentsCount: 23,
    joinDate: new Date('2021-02-15'),
    bio: 'Researcher of Indian philosophical traditions and their contemporary applications. Author of "Eastern Wisdom in the Modern World" and regular contributor to Philosophy East & West.'
  },
  {
    id: 'user7',
    firstName: 'David',
    lastName: 'Wang',
    username: 'strategist',
    avatar: 'https://i.pravatar.cc/150?u=strategist',
    reviewsReceived: 96,
    reviewsGiven: 108,
    friendsInvited: 34,
    savedDocumentsCount: 59,
    savedDocuments: ['107', '110'],
    uploadedDocuments: ['107'],
    publicDocumentsCount: 15,
    totalDocumentsCount: 21,
    joinDate: new Date('2021-06-03'),
    bio: 'Business strategy consultant with background in military history. I specialize in applying classical strategic principles to contemporary organizational challenges.'
  },
  {
    id: 'user8',
    firstName: 'Isabella',
    lastName: 'Romano',
    username: 'rinascimento',
    avatar: 'https://i.pravatar.cc/150?u=rinascimento',
    reviewsReceived: 82,
    reviewsGiven: 75,
    friendsInvited: 18,
    savedDocumentsCount: 48,
    savedDocuments: ['108', '110'],
    uploadedDocuments: ['110'],
    publicDocumentsCount: 10,
    totalDocumentsCount: 14,
    joinDate: new Date('2021-07-22'),
    bio: 'Italian literature specialist with focus on Dante and the Renaissance. Currently researching the intersection of politics and poetry in 14th century Florence.'
  },
  {
    id: 'user9',
    firstName: 'Ahmed',
    lastName: 'Hassan',
    username: 'sumerianlore',
    avatar: 'https://i.pravatar.cc/150?u=sumerianlore',
    reviewsReceived: 76,
    reviewsGiven: 93,
    friendsInvited: 21,
    savedDocumentsCount: 53,
    savedDocuments: ['109', '104'],
    uploadedDocuments: ['109'],
    publicDocumentsCount: 12,
    totalDocumentsCount: 16,
    joinDate: new Date('2021-08-14'),
    bio: 'Archaeologist and ancient Mesopotamian specialist. My work focuses on early literary texts and their historical contexts in the development of human civilization.'
  },
  {
    id: 'user10',
    firstName: 'Hannah',
    lastName: 'Miller',
    username: 'renaissancethought',
    avatar: 'https://i.pravatar.cc/150?u=renaissancethought',
    reviewsReceived: 91,
    reviewsGiven: 88,
    friendsInvited: 25,
    savedDocumentsCount: 57,
    savedDocuments: ['103', '110'],
    uploadedDocuments: ['110'],
    publicDocumentsCount: 14,
    totalDocumentsCount: 18,
    joinDate: new Date('2021-09-05'),
    bio: 'Intellectual historian focusing on Renaissance political thought. Currently exploring the reception of Machiavelli in early modern Europe and contemporary relevance.'
  },
  {
    id: 'user11',
    firstName: 'Rahul',
    lastName: 'Gupta',
    username: 'vedantist',
    avatar: 'https://i.pravatar.cc/150?u=vedantist',
    reviewsReceived: 85,
    reviewsGiven: 104,
    friendsInvited: 22,
    savedDocumentsCount: 61,
    savedDocuments: ['106', '111'],
    uploadedDocuments: ['111'],
    publicDocumentsCount: 13,
    totalDocumentsCount: 19,
    joinDate: new Date('2020-12-17'),
    bio: 'Researcher of Vedantic philosophy and consciousness studies. My interdisciplinary approach connects ancient wisdom traditions with contemporary cognitive science.'
  },
  {
    id: 'user12',
    firstName: 'Olivia',
    lastName: 'Bennett',
    username: 'anglosaxonist',
    avatar: 'https://i.pravatar.cc/150?u=anglosaxonist',
    reviewsReceived: 74,
    reviewsGiven: 81,
    friendsInvited: 16,
    savedDocumentsCount: 45,
    savedDocuments: ['112'],
    uploadedDocuments: ['112'],
    publicDocumentsCount: 9,
    totalDocumentsCount: 13,
    joinDate: new Date('2022-01-08'),
    bio: 'Medieval literature specialist focusing on Old and Middle English. My research explores heroic traditions and their cultural contexts in Anglo-Saxon England.'
  }
];

// Export function to get users
export const getHomeUsers = (): MockUser[] => {
  return scholarUsers;
};

// Generate a more diverse set of tags for documents
const generateTagPool = (): string[] => {
  const commonTags = [
    'research', 'study', 'notes', 'school', 'work', 'project', 'report',
    'analysis', 'science', 'math', 'history', 'literature', 'physics', 'chemistry',
    'biology', 'medicine', 'engineering', 'computer', 'programming', 'data',
    'statistics', 'business', 'finance', 'marketing', 'management', 'legal',
    'law', 'policy', 'government', 'politics', 'philosophy', 'psychology',
    'social', 'culture', 'language', 'art', 'design', 'music', 'personal'
  ];
  
  return commonTags;
};

// Generate random date between 1 day ago and 3 weeks ago
const generateRecentDate = (): Date => {
  const now = new Date();
  // Random between 1 and 21 days (3 weeks)
  const daysAgo = Math.floor(Math.random() * 20) + 1;
  now.setDate(now.getDate() - daysAgo);
  return now;
};

// Add the new classics documents for the homepage
const classicDocuments: HomeDocument[] = [
  {
    id: '101',
    title: 'The Iliad: Critical Analysis and Commentary',
    description: 'A comprehensive literary analysis of Homer\'s epic poem "The Iliad", examining themes of war, honor, and divine intervention in ancient Greek literature.',
    category: 'Literature',
    uploaderUsername: 'classicist',
    uploaderAvatar: 'https://i.pravatar.cc/150?u=classicist',
    uploadDate: generateRecentDate(),
    rating: 4.9,
    commentCount: 42,
    tags: ['ancient literature', 'homer', 'greek'],
    fileType: 'pdf',
    fileSize: '8.4 MB',
    viewCount: 3854,
    downloadCount: 1292,
    isFavorite: false,
    thumbnail: 'https://placehold.co/225x225/3498db/ffffff?text=The+Iliad'
  },
  {
    id: '102',
    title: 'Meditations by Marcus Aurelius: Stoicism in Practice',
    description: 'An exploration of Stoic philosophy through the personal writings of Roman Emperor Marcus Aurelius, with applications for modern ethical living.',
    category: 'Philosophy',
    uploaderUsername: 'stoicmind',
    uploaderAvatar: 'https://i.pravatar.cc/150?u=stoicmind',
    uploadDate: generateRecentDate(),
    rating: 4.8,
    commentCount: 37,
    tags: ['stoicism', 'philosophy', 'ethics'],
    fileType: 'epub',
    fileSize: '2.3 MB',
    viewCount: 4215,
    downloadCount: 1876,
    isFavorite: false,
    thumbnail: 'https://placehold.co/225x225/9b59b6/ffffff?text=Meditations'
  },
  {
    id: '103',
    title: 'The Republic: Plato\'s Vision of Justice',
    description: 'A detailed study of Plato\'s "Republic" focusing on concepts of justice, governance, and the ideal society in ancient Greek philosophy.',
    category: 'Philosophy', 
    uploaderUsername: 'academydebates',
    uploaderAvatar: 'https://i.pravatar.cc/150?u=academydebates',
    uploadDate: generateRecentDate(),
    rating: 4.7,
    commentCount: 29,
    tags: ['plato', 'philosophy', 'justice'],
    fileType: 'pdf',
    fileSize: '6.1 MB',
    viewCount: 3105,
    downloadCount: 1437,
    isFavorite: false,
    thumbnail: 'https://placehold.co/225x225/2ecc71/ffffff?text=The+Republic'
  },
  {
    id: '104',
    title: 'The Bible: Historical Context and Literary Structure',
    description: 'A scholarly examination of the historical development, literary forms, and cultural contexts of biblical texts across different time periods.',
    category: 'Religious Studies',
    uploaderUsername: 'scriptscholar',
    uploaderAvatar: 'https://i.pravatar.cc/150?u=scriptscholar',
    uploadDate: generateRecentDate(), 
    rating: 4.9,
    commentCount: 51,
    tags: ['religion', 'history', 'literature'],
    fileType: 'pdf',
    fileSize: '12.8 MB',
    viewCount: 4892,
    downloadCount: 2154,
    isFavorite: false,
    thumbnail: 'https://placehold.co/225x225/e74c3c/ffffff?text=The+Bible'
  },
  {
    id: '105',
    title: 'The Odyssey: Journey of Transformation',
    description: 'An interpretive analysis of Homer\'s "Odyssey", examining the hero\'s journey, mythological elements, and cultural significance in ancient Greek society.',
    category: 'Literature',
    uploaderUsername: 'mythosreader',
    uploaderAvatar: 'https://i.pravatar.cc/150?u=mythosreader',
    uploadDate: generateRecentDate(),
    rating: 4.8,
    commentCount: 34,
    tags: ['homer', 'greek literature', 'mythology'],
    fileType: 'epub',
    fileSize: '4.7 MB',
    viewCount: 3647,
    downloadCount: 1583,
    isFavorite: false,
    thumbnail: 'https://placehold.co/225x225/f39c12/ffffff?text=The+Odyssey'
  },
  {
    id: '106',
    title: 'Bhagavad Gita: Ancient Wisdom for Modern Leadership',
    description: 'Exploring the principles of duty, action, and moral dilemmas in the Bhagavad Gita and their applications for contemporary leadership challenges.',
    category: 'Philosophy',
    uploaderUsername: 'dharmapath',
    uploaderAvatar: 'https://i.pravatar.cc/150?u=dharmapath',
    uploadDate: generateRecentDate(),
    rating: 4.9,
    commentCount: 43,
    tags: ['hinduism', 'leadership', 'ethics'],
    fileType: 'pdf',
    fileSize: '5.3 MB',
    viewCount: 3982,
    downloadCount: 1826,
    isFavorite: false,
    thumbnail: 'https://placehold.co/225x225/3498db/ffffff?text=Bhagavad+Gita'
  },
  {
    id: '107',
    title: 'The Art of War: Strategic Thinking in Sun Tzu\'s Classic',
    description: 'A comprehensive analysis of Sun Tzu\'s military treatise and its enduring principles for strategic thinking in business, politics, and leadership.',
    category: 'Strategy',
    uploaderUsername: 'strategist',
    uploaderAvatar: 'https://i.pravatar.cc/150?u=strategist',
    uploadDate: generateRecentDate(),
    rating: 4.7,
    commentCount: 39,
    tags: ['strategy', 'leadership', 'ancient china'],
    fileType: 'pdf',
    fileSize: '3.9 MB',
    viewCount: 4567,
    downloadCount: 2013,
    isFavorite: false,
    thumbnail: 'https://placehold.co/225x225/34495e/ffffff?text=Art+of+War'
  },
  {
    id: '108',
    title: 'Dante\'s Divine Comedy: The Journey Through Afterlife',
    description: 'A literary exploration of Dante Alighieri\'s epic poem, examining its allegorical structure, theological themes, and cultural impact on Western literature.',
    category: 'Literature',
    uploaderUsername: 'rinascimento',
    uploaderAvatar: 'https://i.pravatar.cc/150?u=rinascimento',
    uploadDate: generateRecentDate(),
    rating: 4.8,
    commentCount: 31,
    tags: ['dante', 'medieval literature', 'italian poetry'],
    fileType: 'epub',
    fileSize: '7.2 MB',
    viewCount: 2978,
    downloadCount: 1352,
    isFavorite: false,
    thumbnail: 'https://placehold.co/225x225/8e44ad/ffffff?text=Divine+Comedy'
  },
  {
    id: '109',
    title: 'Gilgamesh: The World\'s First Epic Hero',
    description: 'Analyzing the Epic of Gilgamesh as the earliest surviving work of great literature and its explorations of friendship, mortality, and the human condition.',
    category: 'Literature',
    uploaderUsername: 'sumerianlore',
    uploaderAvatar: 'https://i.pravatar.cc/150?u=sumerianlore',
    uploadDate: generateRecentDate(),
    rating: 4.6,
    commentCount: 27,
    tags: ['mesopotamia', 'epic poetry', 'ancient literature'],
    fileType: 'pdf',
    fileSize: '4.5 MB',
    viewCount: 2562,
    downloadCount: 1187,
    isFavorite: false,
    thumbnail: 'https://placehold.co/225x225/e67e22/ffffff?text=Gilgamesh'
  },
  {
    id: '110',
    title: 'Machiavelli\'s The Prince: Power Politics Then and Now',
    description: 'Examining Niccolò Machiavelli\'s controversial political treatise and its insights on political power, leadership, and governance across historical contexts.',
    category: 'Political Science',
    uploaderUsername: 'renaissancethought',
    uploaderAvatar: 'https://i.pravatar.cc/150?u=renaissancethought',
    uploadDate: generateRecentDate(),
    rating: 4.7,
    commentCount: 36,
    tags: ['machiavelli', 'politics', 'renaissance'],
    fileType: 'pdf',
    fileSize: '3.8 MB',
    viewCount: 3214,
    downloadCount: 1493,
    isFavorite: false,
    thumbnail: 'https://placehold.co/225x225/16a085/ffffff?text=The+Prince'
  },
  {
    id: '111',
    title: 'The Upanishads: Ancient Insights into Consciousness',
    description: 'Exploring the philosophical concepts in the ancient Indian Upanishads, focusing on consciousness, reality, and the nature of self.',
    category: 'Philosophy',
    uploaderUsername: 'vedantist',
    uploaderAvatar: 'https://i.pravatar.cc/150?u=vedantist',
    uploadDate: generateRecentDate(),
    rating: 4.9,
    commentCount: 41,
    tags: ['hinduism', 'philosophy', 'consciousness'],
    fileType: 'epub',
    fileSize: '5.6 MB',
    viewCount: 3426,
    downloadCount: 1647,
    isFavorite: false,
    thumbnail: 'https://placehold.co/225x225/27ae60/ffffff?text=Upanishads'
  },
  {
    id: '112',
    title: 'Beowulf: The Oldest English Epic',
    description: 'A thorough analysis of the Old English heroic epic poem Beowulf, examining its historical context, literary techniques, and cultural significance.',
    category: 'Literature',
    uploaderUsername: 'anglosaxonist',
    uploaderAvatar: 'https://i.pravatar.cc/150?u=anglosaxonist',
    uploadDate: generateRecentDate(),
    rating: 4.6,
    commentCount: 28,
    tags: ['medieval', 'old english', 'epic poetry'],
    fileType: 'pdf',
    fileSize: '6.3 MB',
    viewCount: 2753,
    downloadCount: 1218,
    isFavorite: false,
    thumbnail: 'https://placehold.co/225x225/c0392b/ffffff?text=Beowulf'
  }
];

// Export the classic documents
export const getHomeDocuments = (): HomeDocument[] => {
  return classicDocuments;
};

// Persistent data store
class PersistentMockData {
  private static instance: PersistentMockData;
  
  private documents: MockDocument[] = [];
  private users: MockUser[] = [];
  private bookmarkedDocuments: MockDocument[] = [];
  private tagPool: string[] = [];
  private recentSearches: string[] = [
    "@science robots in space",
    "cloud computing",
    "@pdf @research quantum physics",
    "machine learning",
    "neural networks"
  ];
  
  private constructor(documentCount = 12, userCount = 8) {
    console.log("Initializing mock data store");
    this.tagPool = generateTagPool();
    this.generateUsers(userCount);
    this.generateDocuments(documentCount);
    this.updateUserDocumentCounts();
    this.generateBookmarks();
  }
  
  public static getInstance(): PersistentMockData {
    if (!PersistentMockData.instance) {
      PersistentMockData.instance = new PersistentMockData();
    }
    return PersistentMockData.instance;
  }
  
  private generateUsers(count: number): void {
    this.users = Array.from({ length: count }, () => {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const username = faker.internet.userName({ firstName, lastName }).toLowerCase();
      
      return {
        id: faker.string.uuid(),
        firstName,
        lastName,
        username,
        avatar: faker.image.avatar(),
        reviewsReceived: faker.number.int({ min: 0, max: 10 }),
        reviewsGiven: faker.number.int({ min: 0, max: 5 }),
        friendsInvited: faker.number.int({ min: 0, max: 3 }),
        savedDocumentsCount: faker.number.int({ min: 0, max: 6 }),
        savedDocuments: [],
        uploadedDocuments: [],
        publicDocumentsCount: 0,
        totalDocumentsCount: 0,
        joinDate: faker.date.past({ years: 3 }),
        bio: faker.person.bio()
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
      
      // Assign 1-5 random tags from the tag pool
      const tagCount = faker.number.int({ min: 1, max: 5 });
      const selectedTags: string[] = [];
      for (let i = 0; i < tagCount; i++) {
        const tagIndex = faker.number.int({ min: 0, max: this.tagPool.length - 1 });
        const tag = this.tagPool[tagIndex];
        if (!selectedTags.includes(tag)) {
          selectedTags.push(tag);
        }
      }
      
      // Add document to user's uploaded documents
      if (user.uploadedDocuments) {
        user.uploadedDocuments.push(docId);
      }
      
      return {
        id: docId,
        name: `${faker.system.fileName({ extensionCount: 0 })} ${faker.lorem.words(2)}`,
        uploadDate: faker.date.recent({ days: 100 }),
        rating: faker.number.float({ min: 1, max: 5, fractionDigits: 1 }),
        commentCount: faker.number.int({ min: 0, max: 50 }),
        uploaderUsername: user.username,
        uploaderAvatar: user.avatar,
        thumbnailUrl: faker.image.url(),
        fileType,
        fileSize: fileSizeKB > 1000 ? `${fileSizeMB} MB` : `${fileSizeKB} KB`,
        viewCount: faker.number.int({ min: 10, max: 5000 }),
        downloadCount: faker.number.int({ min: 0, max: 1000 }),
        tags: selectedTags,
        isPublic
      };
    });
  }
  
  private updateUserDocumentCounts(): void {
    // Calculate document counts for each user
    for (const user of this.users) {
      const userDocuments = this.documents.filter(doc => doc.uploaderUsername === user.username);
      const publicDocuments = userDocuments.filter(doc => doc.isPublic);
      
      user.totalDocumentsCount = userDocuments.length;
      user.publicDocumentsCount = publicDocuments.length;
    }
  }
  
  private generateBookmarks(): void {
    // Create a consistent set of bookmarked documents (about 15% of all documents)
    const bookmarkCount = Math.floor(this.documents.length * 0.15);
    const shuffledDocs = [...this.documents].sort(() => 0.5 - Math.random());
    this.bookmarkedDocuments = shuffledDocs.slice(0, bookmarkCount);
    
    // Also add these bookmarks to user saved documents
    if (this.users.length > 0) {
      const currentUser = this.users[0]; // Simulate current user (first in the list)
      currentUser.savedDocuments = this.bookmarkedDocuments.map(doc => doc.id);
      currentUser.savedDocumentsCount = currentUser.savedDocuments.length;
    }
  }
  
  // Public methods to access the data
  public getDocuments(): MockDocument[] {
    return this.documents;
  }
  
  public getUsers(): MockUser[] {
    return this.users;
  }
  
  public getBookmarkedDocuments(): MockDocument[] {
    return this.bookmarkedDocuments;
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
            user.username.toLowerCase().includes(lowerCaseQuery)
          );
        });
        
        resolve(results);
      }, 500); // 500ms delay to simulate loading
    });
  }
  
  public searchBookmarks(query: string): Promise<MockDocument[]> {
    // Use consistent bookmarked documents
    return new Promise((resolve) => {
      setTimeout(() => {
        if (!query || query.trim() === '') {
          resolve(this.bookmarkedDocuments);
          return;
        }
        
        const lowerCaseQuery = query.toLowerCase();
        const results = this.bookmarkedDocuments.filter((doc) => {
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
  
  public getRecentSearches(): string[] {
    return this.recentSearches;
  }
  
  // Methods to simulate data modifications (without actually changing the stored data)
  public simulateAddDocument(doc: Partial<MockDocument>): Promise<MockDocument> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Create a pseudo-new document but don't actually add it to the store
        const newDoc: MockDocument = {
          id: faker.string.uuid(),
          name: doc.name || `${faker.system.fileName()} ${faker.lorem.words(2)}`,
          uploadDate: new Date(),
          rating: doc.rating || 0,
          commentCount: 0,
          uploaderUsername: doc.uploaderUsername || this.users[0].username,
          uploaderAvatar: doc.uploaderAvatar || this.users[0].avatar,
          thumbnailUrl: doc.thumbnailUrl || faker.image.url(),
          fileType: doc.fileType || 'pdf',
          fileSize: doc.fileSize || `${faker.number.int({ min: 100, max: 10000 })} KB`,
          viewCount: 0,
          downloadCount: 0,
          tags: doc.tags || [],
          isPublic: doc.isPublic !== undefined ? doc.isPublic : true
        };
        resolve(newDoc);
      }, 300);
    });
  }
}

// Initialize the persistent mock data store
const mockDataStore = PersistentMockData.getInstance();

// Export a simplified API to interact with the persistent data
export const mockDataService = {
  getDocuments: () => mockDataStore.getDocuments(),
  getUsers: () => mockDataStore.getUsers(),
  getBookmarkedDocuments: () => mockDataStore.getBookmarkedDocuments(),
  searchDocuments: (query: string) => mockDataStore.searchDocuments(query),
  searchUsers: (query: string) => mockDataStore.searchUsers(query),
  searchBookmarks: (query: string) => mockDataStore.searchBookmarks(query),
  getRecentSearches: () => mockDataStore.getRecentSearches(),
  simulateAddDocument: (doc: Partial<MockDocument>) => mockDataStore.simulateAddDocument(doc)
}; 