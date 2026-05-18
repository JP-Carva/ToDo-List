import swaggerUi from 'swagger-ui-express';

const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'ToDo API',
    version: '1.0.0',
    description: 'Documentacao da API para autenticacao e CRUD de tarefas.',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Servidor local',
    },
  ],
  tags: [
    { name: 'Health' },
    { name: 'Auth' },
    { name: 'Task' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      RegisterRequest: {
        type: 'object',
        required: ['username', 'email', 'password'],
        properties: {
          username: { type: 'string', example: 'joao' },
          email: { type: 'string', format: 'email', example: 'joao@email.com' },
          password: { type: 'string', minLength: 6, example: '123456' },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'joao@email.com' },
          password: { type: 'string', example: '123456' },
        },
      },
      TaskRequest: {
        type: 'object',
        required: ['title', 'status', 'priority'],
        properties: {
          title: { type: 'string', maxLength: 255, example: 'Estudar API' },
          description: { type: 'string', nullable: true, example: 'Preparar apresentacao do CRUD' },
          status: {
            type: 'string',
            enum: ['Pendente', 'Em Andamento', 'Concluída', 'Em Atraso'],
            example: 'Pendente',
          },
          priority: { type: 'integer', minimum: 1, maximum: 5, example: 1 },
          due_date: { type: 'string', format: 'date', nullable: true, example: '2026-05-20' },
        },
      },
      Task: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 10 },
          user_id: { type: 'integer', example: 2 },
          title: { type: 'string', example: 'Estudar API' },
          description: { type: 'string', nullable: true, example: 'Preparar apresentacao do CRUD' },
          status: { type: 'string', example: 'Pendente' },
          priority: { type: 'integer', example: 1 },
          due_date: { type: 'string', format: 'date', nullable: true, example: '2026-05-20' },
          created_at: { type: 'string', format: 'date-time', nullable: true },
          updated_at: { type: 'string', format: 'date-time', nullable: true },
        },
      },
      PaginatedTasks: {
        type: 'object',
        properties: {
          content: {
            type: 'array',
            items: { $ref: '#/components/schemas/Task' },
            example: [
              {
                id: 1,
                user_id: 13,
                title: 'Tarefa 1',
                description: 'Descrição',
                status: 'Pendente',
                priority: 2,
                due_date: '2026-05-25T00:00:00.000Z',
                created_at: '2026-05-18T11:57:25.310Z',
                updated_at: '2026-05-18T11:57:25.310Z',
              },
            ],
          },
          totalElements: { type: 'integer', example: 15 },
          page: { type: 'integer', example: 0 },
          size: { type: 'integer', example: 10 },
        },
      },
      TokenResponse: {
        type: 'object',
        properties: {
          token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Erro interno do servidor' },
        },
      },
      MessageResponse: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Tarefa removida com sucesso.' },
        },
      },
    },
  },
  paths: {
    '/': {
      get: {
        tags: ['Health'],
        summary: 'Health check da API',
        responses: {
          200: {
            description: 'API ativa',
            content: {
              'text/plain': {
                schema: { type: 'string', example: 'Bem-vindo à API ToDo!' },
              },
            },
          },
        },
      },
    },
    '/api/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Registrar usuario',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegisterRequest' },
            },
          },
        },
        responses: {
          201: {
            description: 'Usuario registrado com sucesso',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/TokenResponse' },
              },
            },
          },
          400: {
            description: 'Campos obrigatorios ausentes ou email ja registrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                examples: {
                  missingFields: { value: { error: 'Todos os campos são obrigatórios' } },
                  emailExists: { value: { error: 'Email já registrado' } },
                },
              },
            },
          },
          500: {
            description: 'Erro interno do servidor',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                examples: {
                  generic: { value: { error: 'Erro interno do servidor' } },
                },
              },
            },
          },
        },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Autenticar usuario',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Login realizado com sucesso',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/TokenResponse' },
              },
            },
          },
          400: {
            description: 'Email e senha nao informados',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                examples: {
                  requiredFields: { value: { error: 'Email e senha são obrigatórios' } },
                },
              },
            },
          },
          401: {
            description: 'Credenciais invalidas',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                examples: {
                  invalidCredentials: { value: { error: 'Credenciais inválidas' } },
                },
              },
            },
          },
          500: {
            description: 'Erro interno do servidor',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/auth/profile': {
      delete: {
        tags: ['Auth'],
        summary: 'Deletar conta do usuario autenticado',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Conta deletada com sucesso',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/MessageResponse' },
                examples: {
                  success: { value: { message: 'Conta deletada com sucesso' } },
                },
              },
            },
          },
          401: {
            description: 'Token nao fornecido, invalido ou expirado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                examples: {
                  missingToken: { value: { error: 'Token não fornecido ou inválido' } },
                  invalidToken: { value: { error: 'Token inválido ou expirado' } },
                },
              },
            },
          },
          404: {
            description: 'Usuario nao encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                examples: {
                  notFound: { value: { error: 'Usuário não encontrado' } },
                },
              },
            },
          },
          500: {
            description: 'Erro interno do servidor',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/task': {
      get: {
        tags: ['Task'],
        summary: 'Listar tarefas do usuario autenticado com paginacao',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'page',
            in: 'query',
            schema: { type: 'integer', default: 0 },
            required: false,
            description: 'Numero da pagina (comeca em 0)',
          },
          {
            name: 'size',
            in: 'query',
            schema: { type: 'integer', default: 10 },
            required: false,
            description: 'Quantidade de registros por pagina',
          },
          {
            name: 'status',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['Pendente', 'Em Andamento', 'Concluída', 'Em Atraso'],
            },
            required: false,
            description: 'Filtra por status',
          },
          {
            name: 'search',
            in: 'query',
            schema: { type: 'string' },
            required: false,
            description: 'Busca por parte do titulo ou descricao',
          },
        ],
        responses: {
          200: {
            description: 'Lista paginada de tarefas',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/PaginatedTasks' },
              },
            },
          },
          401: {
            description: 'Token nao fornecido, invalido ou expirado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          500: {
            description: 'Erro ao listar tarefas',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/MessageResponse' },
                examples: {
                  listError: { value: { message: 'Erro ao listar tarefas.' } },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Task'],
        summary: 'Criar tarefa',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/TaskRequest' },
            },
          },
        },
        responses: {
          201: {
            description: 'Tarefa criada com sucesso',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Task' },
              },
            },
          },
          400: {
            description: 'Erro de validacao',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/MessageResponse' },
                examples: {
                  titleRequired: { value: { message: 'O título é obrigatório.' } },
                  invalidStatus: { value: { message: 'Status inválido ou não definido.' } },
                  invalidPriority: { value: { message: 'Prioridade deve ser entre 1 e 5.' } },
                  invalidDueDate: { value: { message: 'Data de vencimento inválida.' } },
                },
              },
            },
          },
          401: {
            description: 'Token nao fornecido, invalido ou expirado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          500: {
            description: 'Erro ao criar tarefa',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/MessageResponse' },
                examples: {
                  createError: { value: { message: 'Erro ao criar tarefa.' } },
                },
              },
            },
          },
        },
      },
    },
    '/api/task/{id}': {
      put: {
        tags: ['Task'],
        summary: 'Atualizar tarefa',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/TaskRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Tarefa atualizada com sucesso',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Task' },
              },
            },
          },
          400: {
            description: 'Erro de validacao',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/MessageResponse' },
              },
            },
          },
          401: {
            description: 'Token nao fornecido, invalido ou expirado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          404: {
            description: 'Tarefa nao encontrada',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/MessageResponse' },
                examples: {
                  notFound: { value: { message: 'Tarefa não encontrada.' } },
                },
              },
            },
          },
          500: {
            description: 'Erro ao atualizar tarefa',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/MessageResponse' },
                examples: {
                  updateError: { value: { message: 'Erro ao atualizar tarefa.' } },
                },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Task'],
        summary: 'Remover tarefa',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          200: {
            description: 'Tarefa removida com sucesso',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/MessageResponse' },
                examples: {
                  success: { value: { message: 'Tarefa removida com sucesso.' } },
                },
              },
            },
          },
          401: {
            description: 'Token nao fornecido, invalido ou expirado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          404: {
            description: 'Tarefa nao encontrada',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/MessageResponse' },
                examples: {
                  notFound: { value: { message: 'Tarefa não encontrada.' } },
                },
              },
            },
          },
          500: {
            description: 'Erro ao remover tarefa',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/MessageResponse' },
                examples: {
                  removeError: { value: { message: 'Erro ao remover tarefa.' } },
                },
              },
            },
          },
        },
      },
    },
  },
};

function setupSwagger(app) {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

export { setupSwagger, swaggerSpec };
