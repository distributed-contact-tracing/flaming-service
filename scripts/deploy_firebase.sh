#!/usr/bin/env bash
echo "Running script deploy_firebase.sh..."
firebase deploy --token $FIREBASE_TOKEN
echo "Script deploy_firebase.sh done."