import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

const STORAGE_KEY = '@workbase_workspace_data';

// Helper to translate database snake_case objects to camelCase JS objects
const mapTaskFromDb = (dbTask, dbComments = []) => ({
  id: dbTask.id,
  title: dbTask.title,
  description: dbTask.description || '',
  projectId: dbTask.project_id,
  assigneeId: dbTask.assignee_id,
  priority: dbTask.priority,
  status: dbTask.status,
  dueDate: dbTask.due_date,
  createdAt: dbTask.created_at ? dbTask.created_at.split('T')[0] : '',
  comments: dbComments
    .filter(c => c.task_id === dbTask.id)
    .map(c => ({
      id: c.id,
      taskId: c.task_id,
      authorName: c.author_name,
      authorAvatar: c.author_avatar,
      text: c.text,
      createdAt: 'Just now'
    }))
});

const mapTaskToDb = (jsTask) => ({
  id: jsTask.id,
  title: jsTask.title,
  description: jsTask.description,
  project_id: jsTask.projectId,
  assignee_id: jsTask.assigneeId,
  priority: jsTask.priority,
  status: jsTask.status,
  due_date: jsTask.dueDate,
});

const mapProjectFromDb = (dbProj) => ({
  id: dbProj.id,
  name: dbProj.name,
  description: dbProj.description || '',
  category: dbProj.category,
  color: dbProj.color,
  createdAt: dbProj.created_at ? dbProj.created_at.split('T')[0] : '',
});

const mapProjectToDb = (jsProj) => ({
  id: jsProj.id,
  name: jsProj.name,
  description: jsProj.description,
  category: jsProj.category,
  color: jsProj.color,
});

const mapMemberFromDb = (dbMemb) => ({
  id: dbMemb.id,
  name: dbMemb.name,
  email: dbMemb.email,
  role: dbMemb.role,
  department: dbMemb.department,
  avatar: dbMemb.avatar,
  status: dbMemb.status,
});

const mapMemberToDb = (jsMemb) => ({
  id: jsMemb.id,
  name: jsMemb.name,
  email: jsMemb.email,
  role: jsMemb.role,
  department: jsMemb.department,
  avatar: jsMemb.avatar,
  status: jsMemb.status,
});

// Load full state: tries Supabase first, falls back to AsyncStorage
export const loadWorkspaceData = async () => {
  try {
    console.log('Synchronizing with Supabase...');
    
    // Query tables in parallel
    const [
      { data: dbProjects, error: projErr },
      { data: dbMembers, error: membErr },
      { data: dbTasks, error: taskErr },
      { data: dbComments, error: commErr },
      { data: dbActivity, error: actErr }
    ] = await Promise.all([
      supabase.from('projects').select('*'),
      supabase.from('members').select('*'),
      supabase.from('tasks').select('*'),
      supabase.from('comments').select('*'),
      supabase.from('activity').select('*').order('created_at', { ascending: false })
    ]);

    if (projErr || membErr || taskErr || commErr || actErr) {
      throw new Error('Supabase fetch failed, triggering offline cache fallback.');
    }

    // Format schemas cleanly
    const projects = dbProjects.map(mapProjectFromDb);
    const members = dbMembers.map(mapMemberFromDb);
    const tasks = dbTasks.map(t => mapTaskFromDb(t, dbComments || []));
    const activity = dbActivity.map(a => ({
      id: a.id,
      message: a.message,
      type: a.type,
      timestamp: a.timestamp
    }));

    const syncedData = { projects, tasks, members, activity };

    // Update local cache for offline availability
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(syncedData));
    console.log('Supabase sync successful. Cache updated.');
    return syncedData;

  } catch (error) {
    console.warn(error.message);
    
    // FALLBACK: Load offline cache from AsyncStorage
    const rawData = await AsyncStorage.getItem(STORAGE_KEY);
    if (rawData) {
      console.log('Successfully loaded offline workspace cache.');
      return JSON.parse(rawData);
    }
    
    return { projects: [], tasks: [], members: [], activity: [] };
  }
};

// Push updates: saves to Supabase and cache
export const saveWorkspaceData = async (data) => {
  try {
    // Write local backup first
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error backing up local cache:', error);
    return false;
  }
};

// Upstream Push handlers
export const pushTaskToCloud = async (task) => {
  try {
    const dbPayload = mapTaskToDb(task);
    const { error } = await supabase.from('tasks').upsert(dbPayload);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Failed pushing task upstream:', err);
    return false;
  }
};

export const pushProjectToCloud = async (project) => {
  try {
    const dbPayload = mapProjectToDb(project);
    const { error } = await supabase.from('projects').upsert(dbPayload);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Failed pushing project upstream:', err);
    return false;
  }
};

export const pushMemberToCloud = async (member) => {
  try {
    const dbPayload = mapMemberToDb(member);
    const { error } = await supabase.from('members').upsert(dbPayload);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Failed pushing member upstream:', err);
    return false;
  }
};

export const pushCommentToCloud = async (comment) => {
  try {
    const dbPayload = {
      id: comment.id,
      task_id: comment.taskId,
      author_name: comment.authorName,
      author_avatar: comment.authorAvatar,
      text: comment.text,
    };
    const { error } = await supabase.from('comments').insert(dbPayload);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Failed pushing comment upstream:', err);
    return false;
  }
};

export const pushActivityToCloud = async (activity) => {
  try {
    const dbPayload = {
      id: activity.id,
      message: activity.message,
      type: activity.type,
      timestamp: activity.timestamp,
    };
    const { error } = await supabase.from('activity').insert(dbPayload);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Failed pushing activity upstream:', err);
    return false;
  }
};

export const deleteTaskFromCloud = async (taskId) => {
  try {
    const { error } = await supabase.from('tasks').delete().eq('id', taskId);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Failed deleting task upstream:', err);
    return false;
  }
};

export const logActivity = (activities, message, type) => {
  const newActivity = {
    id: `act_${Date.now()}`,
    message,
    timestamp: 'Just now',
    type,
  };
  // Push live activity upstream asynchronously
  pushActivityToCloud(newActivity);
  return [newActivity, ...activities].slice(0, 50);
};
