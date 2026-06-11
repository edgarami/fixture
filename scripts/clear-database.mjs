import { loadLocalEnv } from './load-local-env.mjs';
import { getFirestore } from './firebase-admin-init.mjs';
import admin from 'firebase-admin';

loadLocalEnv();
const db = getFirestore();

async function clearAuthUsers() {
    console.log('Iniciando limpieza de usuarios en Firebase Authentication...');
    let nextPageToken;
    let totalDeleted = 0;
    
    do {
        const listUsersResult = await admin.auth().listUsers(100, nextPageToken);
        const uids = listUsersResult.users.map((user) => user.uid);
        
        if (uids.length > 0) {
            const deleteResult = await admin.auth().deleteUsers(uids);
            totalDeleted += deleteResult.successCount;
            console.log(`Eliminados ${deleteResult.successCount} usuarios.`);
            if (deleteResult.failureCount > 0) {
                console.error(`Error al eliminar ${deleteResult.failureCount} usuarios:`, deleteResult.errors);
            }
        }
        nextPageToken = listUsersResult.pageToken;
    } while (nextPageToken);
    
    console.log(`Total de usuarios eliminados de Auth: ${totalDeleted}`);
}

async function deleteCollection(collectionPath, batchSize = 100) {
    const collectionRef = db.collection(collectionPath);
    const query = collectionRef.limit(batchSize);
    
    let deletedCount = 0;
    
    while (true) {
        const snapshot = await query.get();
        if (snapshot.size === 0) {
            break;
        }
        
        const batch = db.batch();
        snapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });
        
        await batch.commit();
        deletedCount += snapshot.size;
        console.log(`Eliminados ${snapshot.size} documentos de '${collectionPath}'...`);
    }
    
    console.log(`Colección '${collectionPath}' completamente vaciada. Total: ${deletedCount} documentos.`);
}

async function main() {
    try {
        console.log('--- INICIANDO LIMPIEZA DE BASE DE DATOS ---');
        
        // 1. Limpiar usuarios de Auth
        await clearAuthUsers();
        
        // 2. Limpiar colecciones de Firestore de usuarios
        const collectionsToClear = ['profiles', 'bets', 'penalty_bets', 'group_bets'];
        for (const col of collectionsToClear) {
            await deleteCollection(col);
        }
        
        console.log('\n--- LIMPIEZA COMPLETADA CON ÉXITO ---');
        console.log('Los datos de usuarios, perfiles y apuestas han sido eliminados.');
        console.log('Nota: La colección "matches" y "config" no fueron modificadas para no perder la configuración de los partidos.');
    } catch (error) {
        console.error('Error durante la limpieza de la base de datos:', error);
    }
}

main();
