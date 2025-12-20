#!/bin/bash

# Trace Generation Script for Microservices
export AWS_PROFILE=dev-0504

echo "🚀 GENERATING DISTRIBUTED TRACES ACROSS MICROSERVICES"

# Get pod names
USER_POD=$(kubectl get pods -n user-service -l app=user-service -o jsonpath='{.items[0].metadata.name}')
ORDER_POD=$(kubectl get pods -n order-service -l app=order-service -o jsonpath='{.items[0].metadata.name}')
INVENTORY_POD=$(kubectl get pods -n inventory-service -l app=inventory-service -o jsonpath='{.items[0].metadata.name}')
PAYMENT_POD=$(kubectl get pods -n payment-service -l app=payment-service -o jsonpath='{.items[0].metadata.name}')
NOTIFICATION_POD=$(kubectl get pods -n notification-service -l app=notification-service -o jsonpath='{.items[0].metadata.name}')

echo "📦 BUSINESS FLOW 1: Complete Order Processing"
kubectl exec -n user-service $USER_POD -- wget -qO- http://order-service.order-service.svc.cluster.local/health
kubectl exec -n order-service $ORDER_POD -- wget -qO- http://inventory-service.inventory-service.svc.cluster.local/health  
kubectl exec -n inventory-service $INVENTORY_POD -- wget -qO- http://payment-service.payment-service.svc.cluster.local/health
kubectl exec -n payment-service $PAYMENT_POD -- wget -qO- http://notification-service.notification-service.svc.cluster.local/health

echo "👤 BUSINESS FLOW 2: User Management"
kubectl exec -n order-service $ORDER_POD -- wget -qO- http://user-service.user-service.svc.cluster.local/health
kubectl exec -n payment-service $PAYMENT_POD -- wget -qO- http://user-service.user-service.svc.cluster.local/health

echo "🔄 BUSINESS FLOW 3: Inventory & Notifications"
kubectl exec -n user-service $USER_POD -- wget -qO- http://inventory-service.inventory-service.svc.cluster.local/health
kubectl exec -n inventory-service $INVENTORY_POD -- wget -qO- http://notification-service.notification-service.svc.cluster.local/health

echo "✅ Generated distributed traces across all 5 microservices"
echo "🔍 Check traces at: https://grafana.local/explore (select Tempo datasource)"
