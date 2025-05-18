export interface MockUser {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
    avatar: string;

    comments: MockComment[];
    ratings: MockRating[];
    documents: MockDocument[];
    savedDocuments: MockBookmark[];

    bio: string;
    joinDate: Date;
}

export interface MockBookmark {
    id: string;
    user: MockUser;
    document: MockDocument;
    timestamp: Date;
}

export interface MockDocument {
    id: string;
    title: string;
    description: string;
    rating: MockRating;
    comments: MockComment[];
    author: MockUser;
    file: MockFile;
}

export interface MockComment {
    id: string;
    author: MockUser;
    document: MockDocument;
    content: string;
    timestamp: Date;
}

export interface MockFile {
    id: string;
    author: MockUser;
    thumbnail: string;
    type: 'pdf' | 'word' | 'powerpoint' | 'txt' | 'epub';
    size: string;
    viewCount: number;
    downloadCount: number;
    tags: string[];
    isPublic: boolean;
    uploadedAt: Date;
}

export interface MockRating {
    id: string;
    author: MockUser;
    document: MockDocument;
    rating: number;
    timestamp: Date;
}
