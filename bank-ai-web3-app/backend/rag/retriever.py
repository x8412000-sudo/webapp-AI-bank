# backend/rag/retriever.py
from .vector_store import VectorStore
from .document_loader import DocumentLoader
import os

class RAGRetriever:
    def __init__(self):
        self.vector_store = VectorStore()
        self.document_loader = DocumentLoader()
        
        # 初始化知识库
        self._initialize_knowledge_base()
    
    def _initialize_knowledge_base(self):
        """初始化知识库"""
        if self.vector_store.get_count() == 0:
            print("正在初始化知识库...")
            
            # 加载文档
            documents = self.document_loader.load_all_documents()
            
            if not documents:
                print("未找到知识库文档，创建基础数据...")
                documents = self._create_basic_knowledge()
            
            # 添加到向量数据库
            docs_content = [doc["content"] for doc in documents]
            docs_metadata = [doc["metadata"] for doc in documents]
            
            self.vector_store.add_documents(
                documents=docs_content,
                metadatas=docs_metadata
            )
            
            print(f"知识库初始化完成，添加了 {len(documents)} 个文档")
    
    def _create_basic_knowledge(self):
        """创建基础知识库"""
        return [
            {
                "content": "活期储蓄账户利率为0.3%，随时可以存取，没有最低存款要求。",
                "metadata": {"source": "基础知识", "type": "savings_account"}
            },
            {
                "content": "定期存款利率：1年期1.5%，3年期2.5%，5年期3.0%。提前支取按活期利率计算。",
                "metadata": {"source": "基础知识", "type": "fixed_deposit"}
            },
            {
                "content": "个人住房贷款最低利率为4.2%，最长贷款期限30年，需要提供收入证明和房产抵押。",
                "metadata": {"source": "基础知识", "type": "mortgage"}
            },
            {
                "content": "货币基金是低风险投资产品，年化收益率通常在2%-3%之间，适合短期资金管理。",
                "metadata": {"source": "基础知识", "type": "investment"}
            },
            {
                "content": "当前美元兑人民币汇率为7.18，欧元兑人民币为7.80，日元兑人民币为0.048。",
                "metadata": {"source": "汇率数据", "type": "exchange_rate"}
            }
        ]
    
    def retrieve(self, query: str, n_results: int = 3):
        """检索相关文档"""
        results = self.vector_store.search(query, n_results)
        
        # 格式化检索结果
        retrieved_docs = []
        for i, (doc, metadata) in enumerate(zip(results["documents"], results["metadatas"])):
            retrieved_docs.append({
                "content": doc,
                "metadata": metadata,
                "relevance_score": 1 - (results["distances"][i] if i < len(results["distances"]) else 0)
            })
        
        return retrieved_docs
    
    def get_relevant_context(self, query: str, max_tokens: int = 1000) -> str:
        """获取相关上下文"""
        retrieved_docs = self.retrieve(query, n_results=5)
        
        # 按相关性排序
        retrieved_docs.sort(key=lambda x: x["relevance_score"], reverse=True)
        
        # 构建上下文
        context_parts = []
        total_tokens = 0
        
        for doc in retrieved_docs:
            doc_content = f"来源：{doc['metadata'].get('source', '未知')}\n内容：{doc['content']}\n"
            
            if total_tokens + len(doc_content) < max_tokens:
                context_parts.append(doc_content)
                total_tokens += len(doc_content)
            else:
                break
        
        context = "\n---\n".join(context_parts)
        return context
    
    def add_custom_knowledge(self, content: str, metadata: dict = None):
        """添加自定义知识"""
        if not metadata:
            metadata = {"source": "用户添加", "type": "custom"}
        
        self.vector_store.add_documents(
            documents=[content],
            metadatas=[metadata]
        )