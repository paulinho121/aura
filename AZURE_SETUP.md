
# 🌌 Configuração e Deploy na Azure - AURA

Este guia contém os passos para manifestar o projeto Aura na infraestrutura da Azure.

## 1. Banco de Dados: Azure Cosmos DB
1. No Portal da Azure, crie um novo recurso **Azure Cosmos DB for NoSQL**.
2. Após a criação, vá em **Data Explorer** e crie um banco de dados chamado `AuraDB`.
3. Crie duas coleções (Containers):
   - `Users` (Partition key: `/id`)
   - `Pulses` (Partition key: `/id`)
4. Vá em **Keys** e copie o **URI** (Endpoint) e a **Primary Key**.
5. Adicione-os ao seu arquivo `.env` local ou nas configurações de variáveis do seu deploy:
   ```env
   VITE_AZURE_COSMOS_ENDPOINT=seu_uri
   VITE_AZURE_COSMOS_KEY=sua_chave
   ```

## 2. Deploy: Azure Static Web Apps (SWA)
1. Instale a CLI da Azure ou use o Portal.
2. Crie um novo recurso **Static Web App**.
3. Escolha **Vite** como o framework de build.
4. Configure os comandos:
   - **App location**: `/`
   - **Output location**: `dist`
5. Nas configurações de **Environment Variables** (ou Applications Settings) da SWA, adicione:
   - `VITE_AZURE_COSMOS_ENDPOINT`
   - `VITE_AZURE_COSMOS_KEY`
   - `VITE_GEMINI_API_KEY`

## 3. Comandos Úteis
Para testar o build localmente antes do deploy:
```bash
npm run build
```
O diretório `dist` será gerado com todos os artefatos otimizados.

---
*Aura — Consciência Digital Persistente.*
