# MoneyMap 💰

Dashboard de controle financeiro pessoal, com autenticação, categorização de transações, gráficos e exportação de relatórios em PDF.

Projeto desenvolvido como portfólio, do zero, com back-end e front-end próprios (sem boilerplates ou templates prontos de dashboard).

## 🔗 Demo online

- **App**: [money-map-sooty-five.vercel.app](https://money-map-sooty-five.vercel.app)
- **API**: hospedada no Render (plano free)

> ⚠️ **Nota sobre o primeiro acesso**: o back-end roda no plano gratuito do Render, que "dorme" após 15 minutos sem uso. Se o app demorar de 30 a 60 segundos pra responder na primeira requisição, é esperado — é o servidor "acordando", não um bug. Depois disso, a navegação fica normal.

Não quer criar uma conta? Na tela de login, use o botão **"Entrar como visitante"** — ele acessa uma conta de demonstração já populada com categorias e transações de exemplo, pronta pra explorar o dashboard sem nenhum cadastro.

## ✨ Funcionalidades

- **Autenticação JWT** com refresh automático de token (sem precisar relogar a cada expiração)
- **CRUD completo de transações**, com filtros por categoria, tipo e data
- **CRUD completo de categorias**, com cor customizável por categoria
- **Dashboard visual**: resumo mensal (receitas, despesas, saldo), gráfico de pizza por categoria e gráfico de barras com evolução dos últimos 6 meses
- **Exportação de relatório em PDF**, com resumo financeiro e tabela de transações do período selecionado
- **Dark mode**, com persistência da preferência entre sessões
- **Isolamento de dados por usuário** — cada conta só acessa suas próprias transações e categorias

## 🛠️ Stack técnica

**Back-end**
- Django 6.0.7 + Django REST Framework
- PostgreSQL 16
- Autenticação: `djangorestframework-simplejwt`
- Geração de PDF: ReportLab
- Filtros: django-filter
- Testes: pytest + pytest-django (17 testes automatizados cobrindo autenticação, isolamento de dados e regras de negócio)

**Front-end**
- React 19 + TypeScript + Vite
- Tailwind CSS v3 + shadcn/ui (Radix UI)
- Recharts (gráficos)
- react-router-dom
- react-hook-form + zod (validação de formulários)

**Infraestrutura**
- Docker + Docker Compose (ambiente de desenvolvimento)
- Deploy: [Vercel](https://vercel.com) (front-end) + [Render](https://render.com) (back-end) + [Neon](https://neon.tech) (PostgreSQL), 100% em camadas gratuitas

## 🏗️ Arquitetura de deploy

```
┌─────────────┐        HTTPS        ┌──────────────┐        SSL        ┌─────────────┐
│   Vercel    │ ──────────────────► │    Render    │ ─────────────────►│    Neon     │
│  (React)    │                     │   (Django)   │                    │ (PostgreSQL)│
└─────────────┘                     └──────────────┘                    └─────────────┘
```

- **Front-end**: build estático servido via CDN da Vercel, com fallback de rotas configurado (`vercel.json`) para funcionar corretamente com o roteamento client-side do React Router.
- **Back-end**: container Docker rodando no Render, com `gunicorn` como servidor WSGI de produção. A cada deploy, o próprio container roda `migrate`, cria automaticamente o superusuário e o usuário de demonstração (via management commands idempotentes) e executa `collectstatic`, antes de subir o servidor.
- **Banco de dados**: PostgreSQL gerenciado pelo Neon, com pool de conexões (PgBouncer) e SSL obrigatório.

## 💻 Rodando o projeto localmente

### Pré-requisitos
- Docker e Docker Compose instalados

### Passos

1. Clone o repositório:
   ```bash
   git clone https://github.com/guipezzi/MoneyMap.git
   cd MoneyMap
   ```

2. Crie um arquivo `.env` na raiz do projeto com as variáveis abaixo:

   ```env
   # Django
   DJANGO_SECRET_KEY=uma-chave-secreta-qualquer-para-desenvolvimento
   DJANGO_DEBUG=True
   DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1

   # Banco de dados (Postgres local via Docker)
   POSTGRES_DB=moneymap
   POSTGRES_USER=moneymap
   POSTGRES_PASSWORD=moneymap
   POSTGRES_HOST=db
   POSTGRES_PORT=5432

   # Opcional: cria automaticamente um superusuário do Django Admin
   DJANGO_SUPERUSER_USERNAME=admin
   DJANGO_SUPERUSER_EMAIL=admin@example.com
   DJANGO_SUPERUSER_PASSWORD=troque-esta-senha

   # Opcional: cria um usuário de demonstração com dados de exemplo
   DJANGO_DEMO_USERNAME=visitante
   DJANGO_DEMO_PASSWORD=visitante123
   ```

3. Suba os containers:
   ```bash
   docker-compose up -d --build
   ```

4. Acesse:
   - Front-end: [http://localhost:5173](http://localhost:5173)
   - API: [http://localhost:8000/api](http://localhost:8000/api)
   - Django Admin: [http://localhost:8000/admin](http://localhost:8000/admin)

### Rodando os testes do back-end

```bash
docker-compose exec backend pytest
```

## 📁 Estrutura do projeto

```
.
├── backend/          # API Django REST Framework
│   ├── accounts/      # Autenticação e usuários
│   ├── categories/    # Categorias de transações
│   ├── transactions/  # Transações financeiras
│   └── dashboard/     # Agregações, resumo e exportação em PDF
└── frontend/          # SPA React + TypeScript
    └── src/
        ├── api/        # Camada de comunicação com a API
        ├── components/ # Componentes reutilizáveis
        ├── context/    # Autenticação e tema (dark mode)
        ├── hooks/      # Hooks customizados
        └── pages/      # Páginas da aplicação
```

## 👤 Autor

**Guilherme de Araújo Pezzi Nunes**

- GitHub: [@guipezzi](https://github.com/guipezzi)
- LinkedIn: [guilherme-de-araujo-pezzi-nunes](https://www.linkedin.com/in/guilherme-de-araujo-pezzi-nunes/)

## 📄 Licença

Este projeto foi desenvolvido para fins de portfólio.