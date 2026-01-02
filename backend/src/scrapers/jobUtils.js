// Job type detection based on title keywords
export function detectJobType(title) {
  const titleLower = title.toLowerCase();
  
  if (titleLower.includes('intern') || titleLower.includes('trainee') || titleLower.includes('fresher')) {
    return 'Internship';
  }
  if (titleLower.includes('contract') || titleLower.includes('temporary')) {
    return 'Contract';
  }
  if (titleLower.includes('part-time') || titleLower.includes('part time')) {
    return 'Part-time';
  }
  if (titleLower.includes('remote') || titleLower.includes('work from home')) {
    return 'Remote';
  }
  return 'Full-time';
}

// Job category detection based on title keywords
export function detectCategory(title) {
  const titleLower = title.toLowerCase();
  
  // Engineering & Development
  if (titleLower.includes('software') || titleLower.includes('developer') || 
      titleLower.includes('engineer') || titleLower.includes('programming') ||
      titleLower.includes('full stack') || titleLower.includes('backend') ||
      titleLower.includes('frontend') || titleLower.includes('java') ||
      titleLower.includes('python') || titleLower.includes('node') ||
      titleLower.includes('.net') || titleLower.includes('react') ||
      titleLower.includes('angular') || titleLower.includes('devops')) {
    return 'Engineering';
  }
  
  // Data & Analytics
  if (titleLower.includes('data') || titleLower.includes('analyst') ||
      titleLower.includes('analytics') || titleLower.includes('machine learning') ||
      titleLower.includes('ai') || titleLower.includes('artificial intelligence') ||
      titleLower.includes('business intelligence') || titleLower.includes('bi ')) {
    return 'Data & Analytics';
  }
  
  // Cloud & Infrastructure
  if (titleLower.includes('cloud') || titleLower.includes('aws') ||
      titleLower.includes('azure') || titleLower.includes('gcp') ||
      titleLower.includes('infrastructure') || titleLower.includes('sre') ||
      titleLower.includes('platform')) {
    return 'Cloud & Infrastructure';
  }
  
  // Security
  if (titleLower.includes('security') || titleLower.includes('cyber') ||
      titleLower.includes('soc') || titleLower.includes('penetration')) {
    return 'Security';
  }
  
  // QA & Testing
  if (titleLower.includes('qa') || titleLower.includes('test') ||
      titleLower.includes('quality') || titleLower.includes('automation')) {
    return 'QA & Testing';
  }
  
  // Management & Consulting
  if (titleLower.includes('manager') || titleLower.includes('lead') ||
      titleLower.includes('director') || titleLower.includes('consultant') ||
      titleLower.includes('project') || titleLower.includes('scrum') ||
      titleLower.includes('agile')) {
    return 'Management';
  }
  
  // Design
  if (titleLower.includes('design') || titleLower.includes('ux') ||
      titleLower.includes('ui') || titleLower.includes('creative')) {
    return 'Design';
  }
  
  // Sales & Marketing
  if (titleLower.includes('sales') || titleLower.includes('marketing') ||
      titleLower.includes('business development') || titleLower.includes('account')) {
    return 'Sales & Marketing';
  }
  
  // HR & Operations
  if (titleLower.includes('hr') || titleLower.includes('human resource') ||
      titleLower.includes('recruitment') || titleLower.includes('operations') ||
      titleLower.includes('admin')) {
    return 'HR & Operations';
  }
  
  // Support
  if (titleLower.includes('support') || titleLower.includes('helpdesk') ||
      titleLower.includes('service desk')) {
    return 'Support';
  }
  
  return 'Technology';
}

// Experience level detection
export function detectExperience(title, description = '') {
  const text = (title + ' ' + description).toLowerCase();
  
  if (text.includes('fresher') || text.includes('entry level') || 
      text.includes('0-1') || text.includes('0 - 1') ||
      text.includes('graduate') || text.includes('intern')) {
    return '0-1 years';
  }
  if (text.includes('junior') || text.includes('1-3') || text.includes('1 - 3')) {
    return '1-3 years';
  }
  if (text.includes('mid') || text.includes('3-5') || text.includes('3 - 5') ||
      text.includes('2-5') || text.includes('2 - 5')) {
    return '3-5 years';
  }
  if (text.includes('senior') || text.includes('5-8') || text.includes('5 - 8') ||
      text.includes('5+') || text.includes('6+')) {
    return '5-8 years';
  }
  if (text.includes('lead') || text.includes('principal') || 
      text.includes('architect') || text.includes('8+') || text.includes('10+')) {
    return '8+ years';
  }
  
  return '2-5 years'; // Default
}
