#!/bin/bash

# Real-time Microservice Interaction Script
export AWS_PROFILE=dev-0504

echo "🚀 REAL-TIME MICROSERVICE ACCESS METHODS"

# Get pod names
USER_POD=$(kubectl get pods -n user-service -l app=user-service -o jsonpath='{.items[0].metadata.name}')
ORDER_POD=$(kubectl get pods -n order-service -l app=order-service -o jsonpath='{.items[0].metadata.name}')

echo "📦 Available Pods:"
echo "User Service: $USER_POD"
echo "Order Service: $ORDER_POD"

echo ""
echo "🔥 METHOD 1: Port-Forward (External Access)"
echo "kubectl port-forward -n user-service svc/user-service 8080:80"
echo "curl http://localhost:8080/health"

echo ""
echo "🔥 METHOD 2: Pod-to-Pod Communication (Generates Distributed Traces)"
echo "# Health checks"
kubectl exec -n user-service $USER_POD -- wget -qO- localhost:3001/health
kubectl exec -n order-service $ORDER_POD -- wget -qO- localhost:3002/health

echo ""
echo "# Cross-service calls (creates distributed traces)"
kubectl exec -n user-service $USER_POD -- wget -qO- http://order-service.order-service.svc.cluster.local/health
kubectl exec -n order-service $ORDER_POD -- wget -qO- http://user-service.user-service.svc.cluster.local/health

echo ""
echo "🔥 METHOD 3: Interactive Shell Access"
echo "kubectl exec -it -n user-service $USER_POD -- /bin/sh"

echo ""
echo "🔥 METHOD 4: Real-time Log Streaming"
echo "kubectl logs -f -n user-service $USER_POD"

echo ""
echo "✅ Each command above generates traces visible in Grafana!"
echo "🔍 Check traces at: https://grafana.local/explore"
