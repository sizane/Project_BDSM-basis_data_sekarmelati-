/** Spesifikasi OpenAPI 3.0 untuk Swagger UI di /api-docs. */
export declare const swaggerSpec: {
    openapi: string;
    info: {
        title: string;
        version: string;
        description: string;
    };
    servers: {
        url: string;
    }[];
    tags: {
        name: string;
    }[];
    components: {
        securitySchemes: {
            bearerAuth: {
                type: string;
                scheme: string;
                bearerFormat: string;
            };
        };
        schemas: {
            SuccessEnvelope: {
                type: string;
                properties: {
                    status: {
                        type: string;
                        enum: string[];
                    };
                    data: {};
                    message: {
                        type: string;
                    };
                    errors: {
                        nullable: boolean;
                        type: string;
                    };
                };
            };
            ErrorResponse: {
                type: string;
                properties: {
                    status: {
                        type: string;
                        enum: string[];
                    };
                    data: {
                        nullable: boolean;
                    };
                    message: {
                        type: string;
                    };
                    errors: {
                        type: string;
                        properties: {
                            code: {
                                type: string;
                                example: string;
                            };
                            details: {
                                type: string;
                                items: {
                                    type: string;
                                };
                            };
                        };
                    };
                };
            };
            PaginationMeta: {
                type: string;
                properties: {
                    current_page: {
                        type: string;
                    };
                    per_page: {
                        type: string;
                    };
                    total: {
                        type: string;
                    };
                    last_page: {
                        type: string;
                    };
                };
            };
            CreatePesanan: {
                type: string;
                required: string[];
                properties: {
                    nama_customer: {
                        type: string;
                        maxLength: number;
                    };
                    no_kontak: {
                        type: string;
                        example: string;
                    };
                    items: {
                        type: string;
                        minItems: number;
                        maxItems: number;
                        description: string;
                        items: {
                            type: string;
                            required: string[];
                            properties: {
                                rincian_pesanan: {
                                    type: string;
                                    maxLength: number;
                                };
                                kuantitas: {
                                    type: string;
                                    minimum: number;
                                };
                                harga_per_item: {
                                    type: string;
                                    minimum: number;
                                };
                            };
                        };
                    };
                    dp: {
                        type: string;
                        minimum: number;
                        default: number;
                    };
                    tenggat: {
                        type: string;
                        format: string;
                        description: string;
                    };
                };
            };
        };
    };
    paths: {
        '/auth/login': {
            post: {
                tags: string[];
                summary: string;
                requestBody: {
                    required: boolean;
                    content: {
                        'application/json': {
                            schema: {
                                type: string;
                                required: string[];
                                properties: {
                                    username: {
                                        type: string;
                                        maxLength: number;
                                    };
                                    password: {
                                        type: string;
                                        minLength: number;
                                    };
                                };
                            };
                        };
                    };
                };
                responses: {
                    200: {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    allOf: ({
                                        $ref: string;
                                    } | {
                                        type: string;
                                        properties: {
                                            data: object;
                                        };
                                    })[];
                                };
                            };
                        };
                    };
                    401: {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                    403: {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                    422: {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                };
            };
        };
        '/auth/logout': {
            post: {
                tags: string[];
                summary: string;
                security: {
                    bearerAuth: never[];
                }[];
                responses: {
                    200: {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    allOf: ({
                                        $ref: string;
                                    } | {
                                        type: string;
                                        properties: {
                                            data: object;
                                        };
                                    })[];
                                };
                            };
                        };
                    };
                    401: {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                };
            };
        };
        '/admins': {
            get: {
                tags: string[];
                summary: string;
                security: {
                    bearerAuth: never[];
                }[];
                parameters: {
                    name: string;
                    in: string;
                    required: boolean;
                    schema: object;
                    description: string | undefined;
                }[];
                responses: {
                    200: {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    allOf: ({
                                        $ref: string;
                                    } | {
                                        type: string;
                                        properties: {
                                            data: {
                                                type: string;
                                                items: object;
                                            };
                                            meta: {
                                                $ref: string;
                                            };
                                        };
                                    })[];
                                };
                            };
                        };
                    };
                    401: {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                    403: {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                };
            };
            post: {
                tags: string[];
                summary: string;
                security: {
                    bearerAuth: never[];
                }[];
                requestBody: {
                    required: boolean;
                    content: {
                        'application/json': {
                            schema: {
                                type: string;
                                required: string[];
                                properties: {
                                    username: {
                                        type: string;
                                        minLength: number;
                                        maxLength: number;
                                    };
                                    password: {
                                        type: string;
                                        minLength: number;
                                    };
                                    full_name: {
                                        type: string;
                                        maxLength: number;
                                    };
                                    role: {
                                        type: string;
                                        enum: string[];
                                    };
                                };
                            };
                        };
                    };
                };
                responses: {
                    201: {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    allOf: ({
                                        $ref: string;
                                    } | {
                                        type: string;
                                        properties: {
                                            data: object;
                                        };
                                    })[];
                                };
                            };
                        };
                    };
                    401: {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                    403: {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                    409: {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                    422: {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                };
            };
        };
        '/admins/{id}': {
            get: {
                tags: string[];
                summary: string;
                security: {
                    bearerAuth: never[];
                }[];
                parameters: {
                    name: string;
                    in: string;
                    required: boolean;
                    schema: {
                        type: string;
                        format: string;
                    };
                }[];
                responses: {
                    200: {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    allOf: ({
                                        $ref: string;
                                    } | {
                                        type: string;
                                        properties: {
                                            data: object;
                                        };
                                    })[];
                                };
                            };
                        };
                    };
                    401: {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                    403: {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                    404: {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                };
            };
        };
        '/admins/{id}/role': {
            patch: {
                tags: string[];
                summary: string;
                security: {
                    bearerAuth: never[];
                }[];
                parameters: {
                    name: string;
                    in: string;
                    required: boolean;
                    schema: {
                        type: string;
                        format: string;
                    };
                }[];
                requestBody: {
                    required: boolean;
                    content: {
                        'application/json': {
                            schema: {
                                type: string;
                                required: string[];
                                properties: {
                                    role: {
                                        type: string;
                                        enum: string[];
                                    };
                                };
                            };
                        };
                    };
                };
                responses: {
                    200: {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    allOf: ({
                                        $ref: string;
                                    } | {
                                        type: string;
                                        properties: {
                                            data: object;
                                        };
                                    })[];
                                };
                            };
                        };
                    };
                    401: {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                    403: {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                    404: {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                    409: {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                };
            };
        };
        '/dashboard/summary': {
            get: {
                tags: string[];
                summary: string;
                security: {
                    bearerAuth: never[];
                }[];
                responses: {
                    200: {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    allOf: ({
                                        $ref: string;
                                    } | {
                                        type: string;
                                        properties: {
                                            data: object;
                                        };
                                    })[];
                                };
                            };
                        };
                    };
                    401: {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                    503: {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                };
            };
        };
        '/pesanan': {
            get: {
                tags: string[];
                summary: string;
                security: {
                    bearerAuth: never[];
                }[];
                parameters: {
                    name: string;
                    in: string;
                    required: boolean;
                    schema: object;
                    description: string | undefined;
                }[];
                responses: {
                    200: {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    allOf: ({
                                        $ref: string;
                                    } | {
                                        type: string;
                                        properties: {
                                            data: {
                                                type: string;
                                                items: object;
                                            };
                                            meta: {
                                                $ref: string;
                                            };
                                        };
                                    })[];
                                };
                            };
                        };
                    };
                    401: {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                    503: {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                };
            };
            post: {
                tags: string[];
                summary: string;
                security: {
                    bearerAuth: never[];
                }[];
                requestBody: {
                    required: boolean;
                    content: {
                        'application/json': {
                            schema: {
                                $ref: string;
                            };
                        };
                    };
                };
                responses: {
                    201: {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    allOf: ({
                                        $ref: string;
                                    } | {
                                        type: string;
                                        properties: {
                                            data: object;
                                        };
                                    })[];
                                };
                            };
                        };
                    };
                    401: {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                    422: {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                    503: {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                };
            };
        };
        '/pesanan/{id}': {
            get: {
                tags: string[];
                summary: string;
                security: {
                    bearerAuth: never[];
                }[];
                parameters: {
                    name: string;
                    in: string;
                    required: boolean;
                    schema: {
                        type: string;
                        format: string;
                    };
                }[];
                responses: {
                    200: {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    allOf: ({
                                        $ref: string;
                                    } | {
                                        type: string;
                                        properties: {
                                            data: object;
                                        };
                                    })[];
                                };
                            };
                        };
                    };
                    401: {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                    404: {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                    503: {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                };
            };
        };
        '/pesanan/{id}/pembayaran': {
            post: {
                tags: string[];
                summary: string;
                security: {
                    bearerAuth: never[];
                }[];
                parameters: {
                    name: string;
                    in: string;
                    required: boolean;
                    schema: {
                        type: string;
                        format: string;
                    };
                }[];
                requestBody: {
                    required: boolean;
                    content: {
                        'application/json': {
                            schema: {
                                type: string;
                                required: string[];
                                properties: {
                                    tanggal_bayar: {
                                        type: string;
                                        format: string;
                                    };
                                    jumlah: {
                                        type: string;
                                        minimum: number;
                                    };
                                    jenis_pembayaran: {
                                        type: string;
                                        enum: string[];
                                    };
                                };
                            };
                        };
                    };
                };
                responses: {
                    200: {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    allOf: ({
                                        $ref: string;
                                    } | {
                                        type: string;
                                        properties: {
                                            data: object;
                                        };
                                    })[];
                                };
                            };
                        };
                    };
                    401: {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                    404: {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                    422: {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                    503: {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                };
            };
        };
        '/piutang': {
            get: {
                tags: string[];
                summary: string;
                security: {
                    bearerAuth: never[];
                }[];
                parameters: {
                    name: string;
                    in: string;
                    required: boolean;
                    schema: object;
                    description: string | undefined;
                }[];
                responses: {
                    200: {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    allOf: ({
                                        $ref: string;
                                    } | {
                                        type: string;
                                        properties: {
                                            data: {
                                                type: string;
                                                items: object;
                                            };
                                            meta: {
                                                $ref: string;
                                            };
                                        };
                                    })[];
                                };
                            };
                        };
                    };
                    401: {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                    503: {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                };
            };
        };
        '/riwayat-transaksi': {
            get: {
                tags: string[];
                summary: string;
                security: {
                    bearerAuth: never[];
                }[];
                parameters: {
                    name: string;
                    in: string;
                    required: boolean;
                    schema: object;
                    description: string | undefined;
                }[];
                responses: {
                    200: {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    allOf: ({
                                        $ref: string;
                                    } | {
                                        type: string;
                                        properties: {
                                            data: {
                                                type: string;
                                                items: object;
                                            };
                                            meta: {
                                                $ref: string;
                                            };
                                        };
                                    })[];
                                };
                            };
                        };
                    };
                    401: {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                    422: {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                    503: {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                };
            };
        };
        '/pengeluaran': {
            get: {
                tags: string[];
                summary: string;
                security: {
                    bearerAuth: never[];
                }[];
                parameters: {
                    name: string;
                    in: string;
                    required: boolean;
                    schema: object;
                    description: string | undefined;
                }[];
                responses: {
                    200: {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    allOf: ({
                                        $ref: string;
                                    } | {
                                        type: string;
                                        properties: {
                                            data: {
                                                type: string;
                                                items: object;
                                            };
                                            meta: {
                                                $ref: string;
                                            };
                                        };
                                    })[];
                                };
                            };
                        };
                    };
                    401: {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                    503: {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                };
            };
            post: {
                tags: string[];
                summary: string;
                security: {
                    bearerAuth: never[];
                }[];
                requestBody: {
                    required: boolean;
                    content: {
                        'application/json': {
                            schema: {
                                type: string;
                                required: string[];
                                properties: {
                                    tanggal_pengeluaran: {
                                        type: string;
                                        format: string;
                                    };
                                    kategori_pengeluaran: {
                                        type: string;
                                        enum: string[];
                                    };
                                    jumlah: {
                                        type: string;
                                        minimum: number;
                                    };
                                    keterangan: {
                                        type: string;
                                        maxLength: number;
                                        description: string;
                                    };
                                };
                            };
                        };
                    };
                };
                responses: {
                    201: {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    allOf: ({
                                        $ref: string;
                                    } | {
                                        type: string;
                                        properties: {
                                            data: object;
                                        };
                                    })[];
                                };
                            };
                        };
                    };
                    401: {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                    422: {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                    503: {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                };
            };
        };
        '/laporan/laba-rugi': {
            get: {
                tags: string[];
                summary: string;
                security: {
                    bearerAuth: never[];
                }[];
                parameters: {
                    name: string;
                    in: string;
                    required: boolean;
                    schema: object;
                    description: string | undefined;
                }[];
                responses: {
                    200: {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    allOf: ({
                                        $ref: string;
                                    } | {
                                        type: string;
                                        properties: {
                                            data: object;
                                        };
                                    })[];
                                };
                            };
                        };
                    };
                    401: {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                    422: {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                    503: {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                };
            };
        };
        '/laporan/level-utang': {
            get: {
                tags: string[];
                summary: string;
                security: {
                    bearerAuth: never[];
                }[];
                parameters: {
                    name: string;
                    in: string;
                    required: boolean;
                    schema: object;
                    description: string | undefined;
                }[];
                responses: {
                    200: {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    allOf: ({
                                        $ref: string;
                                    } | {
                                        type: string;
                                        properties: {
                                            data: {
                                                type: string;
                                                items: object;
                                            };
                                            meta: {
                                                $ref: string;
                                            };
                                        };
                                    })[];
                                };
                            };
                        };
                    };
                    401: {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                    403: {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                    503: {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                };
            };
        };
        '/laporan/{jenis}/export': {
            get: {
                tags: string[];
                summary: string;
                security: {
                    bearerAuth: never[];
                }[];
                parameters: ({
                    name: string;
                    in: string;
                    required: boolean;
                    schema: object;
                    description: string | undefined;
                } | {
                    name: string;
                    in: string;
                    required: boolean;
                    schema: {
                        type: string;
                        enum: string[];
                    };
                })[];
                responses: {
                    200: {
                        description: string;
                        content: {
                            'application/pdf': {
                                schema: {
                                    type: string;
                                    format: string;
                                };
                            };
                        };
                    };
                    401: {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                    403: {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                    422: {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                    500: {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                };
            };
        };
        '/audit-logs': {
            get: {
                tags: string[];
                summary: string;
                security: {
                    bearerAuth: never[];
                }[];
                parameters: {
                    name: string;
                    in: string;
                    required: boolean;
                    schema: object;
                    description: string | undefined;
                }[];
                responses: {
                    200: {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    allOf: ({
                                        $ref: string;
                                    } | {
                                        type: string;
                                        properties: {
                                            data: {
                                                type: string;
                                                items: object;
                                            };
                                            meta: {
                                                $ref: string;
                                            };
                                        };
                                    })[];
                                };
                            };
                        };
                    };
                    401: {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                    403: {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                    422: {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                };
            };
        };
    };
};
//# sourceMappingURL=swagger.d.ts.map