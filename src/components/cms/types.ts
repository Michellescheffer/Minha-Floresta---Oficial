export interface DashboardStats {
    totalProjects: number;
    totalSales: number;
    totalRevenue: number;
    totalCertificates: number;
    activeUsers: number;
    monthlyGrowth: number;
}

export interface Project {
    id: string;
    name: string;
    description: string;
    long_description?: string;
    location: string;
    type: string;
    price_per_sqm: number;
    available_area: number;
    total_area: number;
    status: string;
    image?: string;
    image_url?: string;
    gallery_images?: string[];
    created_at: string;
}

export interface Certificate {
    id: string;
    certificate_number: string;
    area_sqm: number;
    issue_date: string;
    status: string;
    project_id: string;
    projects?: {
        name: string;
        location: string;
    };
}

export interface SaleData {
    month: string;
    sales: number;
    revenue: number;
}
